import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ErrorResponse, QuestionResponse, CorrectAnswerResponse, WrongAnswerResponse, PointsOnlyResponse } from './responses';
import { append, propOr, pipe, contains, dissoc } from 'ramda';
import { CallableContext } from 'firebase-functions/lib/providers/https';

const db = admin.firestore();

export const loadQuestion = functions.https.onCall(async (data: any, context: CallableContext) => {
    return new ErrorResponse('Game over.');
});

export const answerQuestion = functions.https.onCall(async (data: any, context: CallableContext) => {
    return new ErrorResponse('Game over.');
});