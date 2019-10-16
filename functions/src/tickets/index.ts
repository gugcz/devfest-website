import * as tickets from './tickets';
import * as invoice from './invoices';

export const getTickets = tickets.getTickets;
export const getCurrentTicketsForInvoice = tickets.getCurrentTicketsForInvoice;
export const registeredNewTicket = tickets.registeredNewTicket;
export const newInvoiceRequest = invoice.newInvoiceRequest;
export const invoicePaid = invoice.invoicePaid;
export const sendInvoiceToEmail = invoice.newInvoiceSendInvoice;