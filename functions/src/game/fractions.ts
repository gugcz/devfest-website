import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ErrorResponse, WaterGiveSuccessfulResponse } from './responses';
import { assoc, propOr } from 'ramda';
import { CallableContext } from 'firebase-functions/lib/providers/https';

const db = admin.firestore();

export const giveWater = functions.https.onCall(async (data: any, context: CallableContext) => {
    return new ErrorResponse('Game over.');
});