import * as functions from 'firebase-functions';
import * as helpers from './helpers';
import * as rp from 'request-promise';


export const newInvoiceRequest = functions.firestore.document('invoiceRequests/{requestId}').onCreate((snap, context) => {
    const company = snap.data().companyName;
    const countNormal = snap.data().countTicketsNormal;
    const countVIP = snap.data().countVIP;
    const fields = [];
    fields.push(
        {
            "title": "Jméno firmy",
            "value" : company
        }
    );
    if (countNormal !== undefined && countNormal !== null){
        fields.push(
            {
                "title": "Počet lístků",
                "value" : countNormal
            }
        );
    }
    if (countVIP !== undefined && countVIP !== null){
        fields.push(
            {
                "title": "Počet lístků VIP",
                "value" : countVIP
            }
        );
    }
    const slackMessage = {
        "text": "Žádost o novou fakturu :pencil: ",
        "attachments": [
            {
                "fields": fields,
                "color": "#7da453"
            }
        ]
    }
    return helpers.sendInfoIntoSlack(slackMessage);
}); 