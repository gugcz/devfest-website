import * as functions from 'firebase-functions';
import * as gameLogin from './login';
import * as questions from './questions';

export const login = gameLogin.login;
export const loadQuestion = questions.loadQuestion;
export const answerQuestion = questions.answerQuestion;

export function sendResponse(response: any, http: functions.Response) {
    http.setHeader('Access-Control-Allow-Origin', '*');
    http.setHeader('Access-Control-Request-Method', '*');
    http.setHeader('Access-Control-Allow-Headers', '*');
    http.status(200);
    http.end(JSON.stringify({ data: response }));
}
