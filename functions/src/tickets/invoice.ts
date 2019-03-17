import * as functions from 'firebase-functions';
import * as helpers from './helpers';
import * as rp from 'request-promise';


export const newInvoiceRequest = functions.firestore.document('invoiceRequests/{requestId}').onCreate((snap, context) => {
    const company = snap.data().companyName;
    const count = snap.data().countTickets;
    const slackMessage = {
        "text": "Žádost o novou fakturu :pencil: ",
        "attachments": [
            {
                "fields": [{
                    "title": "Jméno firmy",
                    "value" : company
                },{
                    "title": "Počet lístků",
                    "value" : count
                }],
                "color": "#7da453"
            }
        ]
    }
    return helpers.sendInfoIntoSlack(slackMessage);
}); 