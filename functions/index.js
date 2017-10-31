'use strict';

const config = functions.config().firebase;
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const users = require('./users');

admin.initializeApp(config);

exports.saveUserData = users.saveUserData;

const generateScheduleOnChange = require('./schedule-generator-helper.js').generateScheduleOnChange;

exports.scheduleWrite = functions.database
    .ref("/schedule").onWrite(event => {

        const schedulePromise = event.data;
        const sessionsPromise = admin.database().ref('/sessions').once('value');
        const speakersPromise = admin.database().ref('/speakers').once('value');

        return generateScheduleOnChange(schedulePromise, sessionsPromise, speakersPromise);
    });


exports.sessionsWrite = functions.database
    .ref("/sessions").onWrite(event => {
        const sessionsPromise = event.data;
        const schedulePromise = admin.database().ref('/schedule').once('value');
        const speakersPromise = admin.database().ref('/speakers').once('value');

        return generateScheduleOnChange(schedulePromise, sessionsPromise, speakersPromise);
    });

exports.speakersWrite = functions.database
    .ref("/speakers").onWrite(event => {
        const speakersPromise = event.data;
        const sessionsPromise = admin.database().ref('/sessions').once('value');
        const schedulePromise = admin.database().ref('/schedule').once('value');

        return generateScheduleOnChange(schedulePromise, sessionsPromise, speakersPromise);
    });


// Update users scores in games
const userIdDatabase = functions.database.ref('/cdhProgress/{userId}/');
exports.computeScore = userIdDatabase.onUpdate(users.invalidateUser);

const userIdChange = functions.database.ref('/users/{userId}/');
exports.updateScoreByUser = userIdChange.onUpdate(users.invalidateUser);

// Update photo after user create / change
const userChangeOrUpdate = functions.database.ref('/users/{userId}/');
exports.updateUserPhoto = userChangeOrUpdate.onUpdate(users.invalidateUserPhoto);