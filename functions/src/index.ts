import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

import * as old from './old';
import * as invoice from './invoice/invoiceTriggers';


export const generateThumbnailMediaGraphics = old.generateThumbnailMediaGraphics;
export const getTickets = old.getTickets;

export const invoiceProcessCompany = invoice.invoiceProcessCompany;
export const invoiceProcessInvoice = invoice.invoiceProcessInvoice;
export const invoicePaid = invoice.invoicePaid;
/*export const emailEnvoice = invoice.invoiceEmailInvoice;
export const processBank = invoice.processBank;*/