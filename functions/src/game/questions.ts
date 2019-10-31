import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ErrorResponse, QuestionResponse } from './responses';
import { sendResponse } from '.';
import {propOr, pipe, contains, dissoc} from 'ramda';

const db = admin.firestore();

export const loadQuestion = functions.https.onRequest(async (request: functions.Request, response: functions.Response) => {
    const questionId = request.body.questionId;
    const number = request.body.number;

    if (questionId && number) {
        const userSnap = await db.collection('users').doc(number).get();
        if (userSnap.exists) {
            const userData = await userSnap.data();
            const containsQuestionId = pipe(
                propOr([], 'answeredQuestions'),
                contains(questionId),
            )(userData);

            if (containsQuestionId) {
                sendResponse(new ErrorResponse('Question already answered.'), response);
            } else {
                const questionSnap = await db.collection('questions').doc(questionId).get();
                if (questionSnap.exists) {
                    const question = questionSnap.data();
                    const questionResponse = new QuestionResponse(pipe(
                        dissoc('correctAnswer'),
                        dissoc('score'),
                    )(question));
                    sendResponse(questionResponse, response);
                } else {
                    sendResponse(new ErrorResponse('Question with this ID does not exist.'), response);
                }
            }
        } else {
            sendResponse(new ErrorResponse('User not found.'), response);
        }
    } else if (!questionId) {
        sendResponse(new ErrorResponse('Invalid question id.'), response);
    } else {
        sendResponse(new ErrorResponse('Invalid user id.'), response);
    }
});