import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ErrorResponse, QuestionResponse, CorrectAnswerResponse, WrongAnswerResponse } from './responses';
import { sendResponse } from '.';
import { append, propOr, pipe, contains, dissoc } from 'ramda';
import { CallableContext } from 'firebase-functions/lib/providers/https';

const db = admin.firestore();

export const loadQuestion = functions.https.onCall(async (data: any, context: CallableContext) => {
    const questionId = data.questionId;
    const number = data.number;

    if (questionId && number) {
        const userSnap = await db.collection('users').doc(number).get();
        if (userSnap.exists) {
            const userData = await userSnap.data();
            const containsQuestionId = pipe(
                propOr([], 'answeredQuestions'),
                contains(questionId),
            )(userData);

            if (containsQuestionId) {
                return new ErrorResponse('Question already answered.');
            } else {
                const questionSnap = await db.collection('questions').doc(questionId).get();
                if (questionSnap.exists) {
                    const question = questionSnap.data();
                    return new QuestionResponse(pipe(
                        dissoc('correctAnswer'),
                        dissoc('score'),
                    )(question));
                } else {
                    return new ErrorResponse('Question with this ID does not exist.');
                }
            }
        } else {
            return new ErrorResponse('User not found.');
        }
    } else if (!questionId) {
        return new ErrorResponse('No question id provided.');
    } else {
        return new ErrorResponse('No user id provided.');
    }
});

export const answerQuestion = functions.https.onCall(async (data: any, context: CallableContext) => {
    const questionId = data.questionId;
    const number = data.number;
    const answer = data.answer;

    if (questionId && number && answer) {
        const userSnap = await db.collection('users').doc(number).get();
        if (userSnap.exists) {
            const userData = await userSnap.data();
            const containsQuestionId = pipe(
                propOr([], 'answeredQuestions'),
                contains(questionId),
            )(userData);

            if (containsQuestionId) {
                return new ErrorResponse('Question already answered.');
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
                        return new CorrectAnswerResponse(question.score);
                    } else {
                        return new WrongAnswerResponse();
                    }
                } else {
                    return new ErrorResponse('Question with this ID does not exist.');
                }
            }
        } else {
            return new ErrorResponse('User not found.');
        }
    } else if (!questionId) {
        return new ErrorResponse('No question id provided.');
    } else if (!number) {
        return new ErrorResponse('No user id provided.');
    } else {
        return new ErrorResponse('No answer id provided.');
    }
});