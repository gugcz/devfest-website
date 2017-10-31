'use strict';

const firebase = require('firebase');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')();

exports.getStorage = () => {
  return gcs.bucket('devfest-2017-d44d9.appspot.com');
}

exports.fetchPrivateParts = () => {
  return new Promise((resolve, reject) => {
    admin.database().ref('/cdhPrivateKeyParts').once('value').then(snapshot => {
      resolve(Object.keys(snapshot.val()));
    });
  });
}

exports.fetchUsers = () => {
  return new Promise((resolve, reject) => {
    admin.database().ref('/users/').once('value').then(snapshot => {
      resolve(snapshot.val());
    });
  });
}

exports.fetchUsersProgress = () => {
  return new Promise((resolve, reject) => {
    admin.database().ref(`/cdhProgress/`).once('value').then(snapshot => {
      const users = {};
      snapshot = snapshot.val();

      Object.keys(snapshot).forEach(user => {
        users[user] = [];
        const data = snapshot[user];

        Object.keys(data).forEach(key => {
          const value = data[key];

          if (users[user].indexOf(value.privateKeyPart) < 0) {
            users[user].push(value.privateKeyPart);
          }
        });
      });

      resolve(users);
    });
  });
}

exports.updateUserScore = (userId, score) => {
  const update = {}
  update[`/users/${userId}/cdhScore`] = score;
  return admin.database().ref().update(update);
};

exports.updateUserPhoto = (userId, photo, original) => {
  const update = {}
  update[`/users/${userId}/photoUrl`] = photo;
  update[`/users/${userId}/originalUrl`] = original;
  return admin.database().ref().update(update);
}
