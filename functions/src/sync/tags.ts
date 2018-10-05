import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const changed = functions.firestore.document('tags/{tagId}').onUpdate((snap, context) => {
  const name = snap.after.data().type;
  const color = snap.after.data().color;
  return updateOrCreateTag(name, color);
});

export const created = functions.firestore.document('tags/{tagId}').onCreate((snap, context) => {
  const name = snap.data().type;
  const color = snap.data().color;
  return updateOrCreateTag(name, color);
});

export const deleted = functions.firestore.document('tags/{tagId}').onCreate((snap, context) => {
  const name = snap.data().type;
  const color = snap.data().color;
  return deleteTag(name, color);
});

async function updateOrCreateTag(name, color) {
  const databaseTag = await admin.database().ref('tags').once('value');
  let tags = databaseTag.val();
  if (tags === null){
    tags = {};
  }
  tags[name] = color;
  return admin.database().ref('tags').update(tags);
}

async function deleteTag(name, color) {
  const databaseTag = await admin.database().ref('tags').once('value');
  let tags = databaseTag.val();
  if (tags === null){
    tags = {};
  }
  delete tags[name];
  return admin.database().ref('tags').update(tags);
}