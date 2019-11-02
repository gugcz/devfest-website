import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ErrorResponse, QuestionResponse, CorrectAnswerResponse, WrongAnswerResponse } from './responses';
import { sendResponse } from '.';
import { append, propOr, pipe, contains, dissoc } from 'ramda';

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
        sendResponse(new ErrorResponse('No question id provided.'), response);
    } else {
        sendResponse(new ErrorResponse('No user id provided.'), response);
    }
});

export const answerQuestion = functions.https.onRequest(async (request: functions.Request, response: functions.Response) => {
    const questionId = request.body.questionId;
    const number = request.body.number;
    const answer = request.body.answer;

    if (questionId && number && answer) {
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
                    userData.answeredQuestions = pipe(
                        propOr([], 'answeredQuestions'),
                        append(questionId)
                    )(userData);
                    
                    if (question.correctAnswer === parseInt(answer)) {
                        userData.totalScore = propOr(0, 'totalScore', userData) + propOr(0, 'score', question);
                        userData.actualScore = propOr(0, 'actualScore', userData) + propOr(0, 'score', question);
                    }

                    await db.collection('users').doc(number).set(userData);

                    if (question.correctAnswer === parseInt(answer)) {
                        sendResponse(new CorrectAnswerResponse(question.score), response);
                    } else {
                        sendResponse(new WrongAnswerResponse(), response);
                    }
                } else {
                    sendResponse(new ErrorResponse('Question with this ID does not exist.'), response);
                }
            }
        } else {
            sendResponse(new ErrorResponse('User not found.'), response);
        }
    } else if (!questionId) {
        sendResponse(new ErrorResponse('No question id provided.'), response);
    } else if (!number) {
        sendResponse(new ErrorResponse('No user id provided.'), response);
    } else {
        sendResponse(new ErrorResponse('No answer id provided.'), response);
    }
});