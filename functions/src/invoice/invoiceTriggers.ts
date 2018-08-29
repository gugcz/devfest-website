import * as functions from 'firebase-functions';
import * as fakturoid from './fakturoid';
import * as sendgrid from './sendGrid';
import * as invoiceFire from './invoice';
import * as tito from './tito';
import { emit } from 'cluster';

export const invoiceProcessCompany = functions.firestore.document('invoices/{invoiceId}').onCreate((snap, context) => {
    const id = context.params.invoiceId;
    const newValue = snap.data();
    const email = newValue.email;
    const companyName = newValue.companyName;
    const street = newValue.street;
    const city = newValue.city;
    const zip = newValue.zip;
    const registrationNumberIC = newValue.registrationNumberIC;
    const registrationNumberDIC = newValue.registrationNumberDIC;
    const country = newValue.country;
    return fakturoid.findFaktruoidCompanyId(companyName)
        .then((fakturoidId) => {
            if (fakturoidId === null) {
                return fakturoid.createFakturoidCompany({
                    firebaseId: id,
                    name: companyName,
                    street: street,
                    city: city,
                    email: email,
                    zip: zip,
                    registrationNumberIC: registrationNumberIC,
                    registrationNumberDIC: registrationNumberDIC,
                    country: country
                })
            }
            return fakturoidId
        })
        .then((fakturoidId) => {
            return snap.ref.update({
                facturoidContactFound: true,
                facturoidContactId: fakturoidId
            })
        }).catch((error) => {
            return error;
        })
});

export const invoiceProcessInvoice = functions.firestore.document('invoices/{invoiceId}').onUpdate((snap, context) => {
    const newValue = snap.after.data();
    const fakturoidId = newValue.facturoidContactId;
    const countTickets = newValue.countTickets;
    if (newValue.facturoidInvoiceFound && newValue.sendGridEmailSended && newValue.titoDiscountCodeGenerated && newValue.sendGridDiscountSended) {
        return null;
    }
    if (!newValue.facturoidContactFound) {
        return null;
    }
    if (!newValue.facturoidInvoiceFound) {
        return fakturoid.createInvoice(fakturoidId, countTickets)
            .then((invoice) => {
                return snap.after.ref.update({
                    facturoidInvoiceFound: true,
                    faktruoidInvoiceId: invoice.id,
                    fakturoidInvoiceVariable: invoice.variableSymbol
                })
            }).catch((error) => {
                return error;
            })
    }
    if (!newValue.sendGridEmailSended) {
        return fakturoid.downloadInvoiceById(newValue.faktruoidInvoiceId)
            .then((downloaded) => {
                return sendgrid.sendInvoiceInEmail(downloaded, newValue.email);
            }).then((response) => {
                if (response === true) {
                    return snap.after.ref.update({
                        sendGridEmailSended: true
                    })
                }
                return null;
            }).catch((error) => {
                return error;
            })
    }
    if (!newValue.titoDiscountCodeGenerated && newValue.fakturoidInvoicePaid) {
        return tito.generateTitoCode(newValue.fakturoidInvoicePaidAmmount).then((code) => {
            return snap.after.ref.update({
                titoDiscountCode: code,
                titoDiscountCodeGenerated: true
            })
        }) 
    }
    if (!newValue.sendGridDiscountSended && newValue.titoDiscountCodeGenerated) {
        return sendgrid.sendDiscountCode(newValue.titoDiscountCode, newValue.email).then(() => {
            return snap.after.ref.update({
                sendGridDiscountSended: true
            })
        })
    }
    return null
});

export const invoicePaid = functions.https.onRequest((req, res) => {
    const body = req.body;
    const fakturoidInvoiceId = body.invoice_id;
    if (body.status === "paid" && body.event_name === "invoice_paid") {
        return invoiceFire.setFakturoidInvoicePaid(fakturoidInvoiceId, body.total)
            .then(() => {
                return res.status(200).send(true);
            }).catch((error) => {
                return error;
            })
    }
    return res.status(200).send(true);
})