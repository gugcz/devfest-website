'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Jimp = require('jimp');
const gcs = require('@google-cloud/storage')();
const utils = require('./firebase-utils');

exports.saveUserData = functions.auth.user().onCreate(({ data }) => {
  const uid = data.uid || data.providerData[0].uid;
  const userData = {
    email: data.email || data.providerData[0].email || '',
    displayName: data.displayName || data.providerData[0].displayName || '',
    photoURL: data.photoURL || data.providerData[0].photoURL || ''
  };

  return admin.database().ref(`/webUsers/${uid}`).set(userData);
});

exports.invalidateUser = (event) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      utils.fetchPrivateParts(),
      utils.fetchUsersProgress(),
      utils.fetchUsers()
    ]).then(data => {
      const privateParts = data[0]; // [ pk1, pk2, pk3 ]
      const usersProgress = data[1]; // { user_id: [ keys, ...] }
      const users = data[2]; // { user_id: { email, cdh .. }}
      const userIds = Object.keys(users);

      // Score variables
      const maxScore = privateParts.length * 100;
      const newScore = {}; // User - New score
      const topScore = []; // [ [ user_id, stamp ], [ user_id , stamp ]...

      // Compute new score for everyone
      userIds.forEach(userId => {
        // Skip users without records!
        if (usersProgress[userId]) {
          let score = 0;

          usersProgress[userId].forEach(key => {
            if (privateParts.indexOf(key) >= 0) {
              score += 100;
            }
          });

          newScore[userId] = score;

          if ((score == maxScore) && (users[userId].correctOrderServerTimestamp)) {
            topScore.push([userId, users[userId].correctOrderServerTimestamp]);
          }
        }
      });

      // Sort top score by correctOrderServerTimestamp and add 1000 points to first, -1 to second
      // etc..
      topScore.sort((a, b) => {
        return a[1] - b[1];
      });

      let plusPoints = 1000;
      topScore.forEach(index => {
        newScore[index[0]] += plusPoints;
        plusPoints -= 1;
      });

      const promises = [];

      userIds.forEach(userId => {
        if (!newScore[userId]) {
          newScore[userId] = 0;
        }

        if (users[userId].score != newScore[userId]) {
          promises.push(
            utils.updateUserScore(
              userId,
              newScore[userId]
            )
          );
        }
      });

      resolve(Promise.all(promises));
    });
  });
}

function generatePublicLink(filename) {
  return `https://storage.googleapis.com/devfest-2017-d44d9.appspot.com/users/${filename}`;
}

exports.invalidateUserPhoto = (event) => {
  return new Promise((resolve, reject) => {
    const userId = event.params.userId;

    console.log(`Invalidate user photo id: ${userId}`);

    const photoUrl = event.data.val().photoUrl;
    const bucket = utils.getStorage();

    // When photo is served from storage function, do nothing!
    if (!photoUrl || photoUrl === 'null') {
      // If photo is empty, update to placeholder image from storage
      utils.updateUserPhoto(
        userId,
        generatePublicLink("placeholder.jpg"),
        null
      ).then(ok => {
        resolve('OK');
      }).catch(err => {
        reject(err)
      });
    } else if (photoUrl.startsWith('https://storage.googleapis.com')) {
      // ... nothing to do
      resolve('ok');
    } else {
      console.log(`Fetching photo: ${photoUrl}`);
      // Otherwise download photo from external resource, pixelate it and store
      Jimp.read(photoUrl).then(image => {
        const file = bucket.file(`users/${userId}.png`);

        // Generate write stream
        const stream = file.createWriteStream({
          resumable: false,
          metadata: {
            contentType: 'image/png'
          }
        });

        stream.on('error', (err) => {
          console.log(`Error image: ${err}`);
          console.log(JSON.stringify(err));
          console.log(err.stack);
          reject(err);
        });

        stream.on('finish', () => {
          file.makePublic((err, apiResponse) => {
            if (err) {
              console.log("Error when make public file!");
              console.log(err);
              reject(err);
              return;
            }

            utils.updateUserPhoto(userId, generatePublicLink(`${userId}.png`), photoUrl).then(ok => {
              resolve('OK');
            }).catch(err => {
              reject(err)
            });
          });
        });

        image
          .resize(176, Jimp.AUTO)
          .pixelate(10)
          .getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            if (err) {
              console.log(`Invalid buffer: ${err}`);
              reject(err);
            } else {
              stream.end(buffer);
            }
          });
      });
    }
  });
}
