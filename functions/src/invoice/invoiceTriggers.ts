import * as functions from 'firebase-functions';
import * as fakturoid from './fakturoid';
import * as sendgrid from './sendGrid';
import * as invoiceFire from './invoice';
import * as tito from './tito';
import * as querystring from 'querystring';
import * as slack from './slack';

export const invoiceProcessCompany = functions.firestore.document('invoices/{invoiceId}').onCreate((snap, context) => {
    const id = context.params.invoiceId;
    const newValue = snap.data();
    const email = newValue.email;
    const companyName = newValue.companyName;
    const street = newValue.street;
    const city = newValue.city;
    const zip = newValue.zip;
    const registrationNumberIC = newValue.registrationNumberIC;
    const registrationNumberDIC = (newValue.registrationNumberDIC ? newValue.registrationNumberDIC : null);
    const country = newValue.country;
    const countTickets = newValue.countTickets;
    return fakturoid.findFaktruoidCompanyId(companyName)
        .then((fakturoidId) => {
            if (fakturoidId === null) {
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
                if (registrationNumberDIC){
                    company['registrationNumberDIC'] = registrationNumberDIC;
                }
                return fakturoid.createFakturoidCompany(company)
            }
            return fakturoidId
        })
        .then((fakturoidId) => {
            return snap.ref.update({
                facturoidContactFound: true,
                facturoidContactId: fakturoidId
            })
        }).then(() => {
            return slack.informationToDevfestSlack('FAKTURY - ' + companyName + ' - Zaevidován nový požadavek na fakturu     - pro ' + countTickets + ' lístků')
        }).catch((error) => {
            return error;
        })
});

export const invoiceProcessInvoice = functions.firestore.document('invoices/{invoiceId}').onUpdate((snap, context) => {
    const newValue = snap.after.data();
    const fakturoidId = newValue.facturoidContactId;
    const countTickets = newValue.countTickets;
    const companyName = newValue.companyName;
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
            }).then(() => {
                return slack.informationToDevfestSlack('FAKTURY - ' + companyName + ' - Vygenerovaná nová faktura - ' + companyName)
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
            }).then(() => {
                return slack.informationToDevfestSlack('FAKTURY - ' + companyName + ' - Faktura zaslána na email - ' + companyName)
            }).catch((error) => {
                return error;
            })
    }
    if (!newValue.titoDiscountCodeGenerated && newValue.fakturoidInvoicePaid) {
        return tito.generateTitoCode(newValue.companyName, context.params.invoiceId, countTickets).then((code) => {
            return snap.after.ref.update({
                titoDiscountCode: code,
                titoDiscountLink: ('https://ti.to/devfest-cz/2018/discount/' + querystring.escape(code)),
                titoDiscountCodeGenerated: true
            }).then(() => {
                return slack.informationToDevfestSlack('FAKTURY - ' + companyName + ' - Vygenerován slevový kupón - ' + companyName)
            })
        }) 
    }
    if (!newValue.sendGridDiscountSended && newValue.titoDiscountCodeGenerated) {
        return sendgrid.sendDiscountCode(newValue.titoDiscountCode, newValue.titoDiscountLink, newValue.email).then(() => {
            return snap.after.ref.update({
                sendGridDiscountSended: true
            }).then(() => {
                return slack.informationToDevfestSlack('FAKTURY - ' + companyName + ' - Slevový kupón zaslán na email - ' + )
            })
        })
    }
    return null
});

export const invoicePaid = functions.https.onRequest((req, res) => {
    const body = req.body;
    const fakturoidInvoiceId = body.invoice_id;
    const money = body.total;
    if (body.status === "paid" && body.event_name === "invoice_paid") {
        return invoiceFire.setFakturoidInvoicePaid(fakturoidInvoiceId, body.total)
            .then(() => {
                return res.status(200).send(true);
            }).then(() => {
                return slack.informationToDevfestSlack('FAKTURY - Zaplacená nová faktura - ' + money + ' Kč na účtě HURRAY!!!!')
            }).catch((error) => {
                return error;
            })
    }
    return res.status(200).send(true);
})