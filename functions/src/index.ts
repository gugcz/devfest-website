import * as admin from 'firebase-admin';
admin.initializeApp();
admin.firestore().settings({ timestampsInSnapshots: true });

import * as tickets from './tickets';
import * as schedule from './schedule';
import * as game from './game';

export const getTickets = tickets.getTickets;
export const getCurrentTicketsForInvoice = tickets.getCurrentTicketsForInvoice;
export const registeredNewTicket = tickets.registeredNewTicket;
export const newInvoiceRequest = tickets.newInvoiceRequest;
export const invoicePaid = tickets.invoicePaid;
export const tagUpdateColor = schedule.tagUpdateColor;
export const tagApplyColor = schedule.tagApplyColor;
export const talkUpdate = schedule.talkUpdate;
export const talkApply = schedule.talkApply;
export const roomWrite = schedule.roomOnWrite;
export const speakerUpdate = schedule.speakerOnUpdate;
export const speakerDelete = schedule.speakerOnDelete;
export const updateScheduleOnTalkUpdate = schedule.updateScheduleOnTalkUpdate;
export const onTalkDelete = schedule.onTalkDelete;
export const login = game.login;
export const loadQuestion = game.loadQuestion;
export const answerQuestion = game.answerQuestion;