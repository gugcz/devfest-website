import * as functions from 'firebase-functions';
import * as helpers from './helpers';
import * as admin from 'firebase-admin';
import * as querystring from 'querystring';
import * as sendgrid from './sendgrid';
import * as fakturoid from './fakturoid';
import * as tito from './tito';

/**
 * When request for new invoice is received
 */
export const newInvoiceRequest = functions.firestore.document('invoiceRequests/{requestId}')
    .onCreate(async (snap, context) => {
        const id = context.params.invoiceId;
        const newValue = snap.data();
        const email = newValue.email;
        const companyName = newValue.companyName;
        const street = newValue.street;
        const city = newValue.city;
        const zip = newValue.zip;
        const registrationNumberIC = newValue.registrationNumberIC;
        const vatNumber = (newValue.vatNumber ? newValue.vatNumber : null);
        const country = newValue.country;
        const countNormal = newValue.countTicketsNormal;
        const countVIP = newValue.countTicketsVIP;
        await informIntoSlackAboutNewInvoice(companyName, countNormal, countVIP);
        let invoiceCompanyId = await fakturoid.findFaktruoidCompanyId(companyName);
        if (invoiceCompanyId === null) {
            const company = {
                firebaseId: id,
                name: companyName,
                street: street,
                city: city,
                email: email,
                zip: zip,
                registrationNumberIC: registrationNumberIC,
                country: country
            };
            if (vatNumber) {
                company['vatNumber'] = vatNumber;
            }
            invoiceCompanyId = await fakturoid.createFakturoidCompany(company);
        }
        const invoice = await fakturoid.createInvoice(invoiceCompanyId, countNormal, countVIP);
        await snap.ref.update({
            invoiceFound: true,
            invoiceId: invoice.id,
            invoiceVariable: invoice.variableSymbol
        });
        const downloaded = await fakturoid.downloadInvoiceById(invoice.id);
        const mail = await sendgrid.sendInvoiceInEmail(downloaded, email);
        if (mail === true) {
            await snap.ref.update({
                invoiceSended: true
            })
        } else {
            throw Error('something went wrong with sending invoice');
        }
        return helpers.sendInfoIntoSlack({
            "text": "Faktura zaslána na email :email:"
        });
    });

/**
 * Setting invoice in firestore paid
 */
export const invoicePaid = functions.https.onRequest((req, res) => {
    const body = req.body;
    const key = req.query.key;
    if (key !== functions.config().fakturoid.key) {
        return res.status(403).send('Forbidden');
    } else {
        const invoiceId = body.invoice_id;
        if (body.status === "paid" && body.event_name === "invoice_paid") {
            return sendDiscountCodeByInvoiceId(invoiceId).then(() => {
                return helpers.sendInfoIntoSlack({
                    "text": "Faktura zaplacena, slevový kupón vygenerován a zaslán na email :moneybag:"
                });
            }).then(() => {
                return res.send(200);
            })
        } else {
            return res.send(200);
        }
    }
});

/**
 * Find invoice data in firebase and generates discount and sends to company
 * @param invoiceId - id of invoice in fakturoid
 */
async function sendDiscountCodeByInvoiceId(invoiceId): Promise<Object> {
    const snapshot = await admin.firestore().collection('invoiceRequests').where('invoiceId', '==', invoiceId).get();
    if (snapshot.empty) {
        return false;
    } else {
        const info = snapshot.docs[0].data();
        const code = await tito.generateTitoCode(info.companyName, invoiceId, (info.countTicketsNormal === null ? 0 : info.countTicketsNormal), (info.countTicketsVIP === null ? 0 : info.countTicketsVIP));
        await admin.firestore().collection('invoiceRequests').doc(snapshot.docs[0].id).update({
            discoundCodeSended: true,
        });
        return sendgrid.sendDiscountCode(code, ('https://ti.to/devfest-cz/' + new Date().getFullYear() + '/discount/' + querystring.escape(code)), info.email);
    }
};

/**
 * Sends information into slack about new invoice
 * @param company 
 * @param countNormal 
 * @param countVIP 
 */
async function informIntoSlackAboutNewInvoice(company: string, countNormal: number, countVIP: number) {
    const fields = [];
    fields.push(
        {
            "title": "Jméno firmy",
            "value": company
        }
    );
    if (countNormal !== undefined && countNormal !== null) {
        fields.push(
            {
                "title": "Počet lístků",
                "value": countNormal
            }
        );
    }
    if (countVIP !== undefined && countVIP !== null) {
        fields.push(
            {
                "title": "Počet lístků VIP",
                "value": countVIP
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
    return await helpers.sendInfoIntoSlack(slackMessage);
}