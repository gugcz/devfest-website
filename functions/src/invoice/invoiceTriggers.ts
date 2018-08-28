import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as rp from 'request-promise';

const FACTUROID_COMPANY = 'vaclavpavlicek';

export const invoiceFindContact = functions.firestore.document('invoices/{invoiceId}').onCreate((snap, context) => {
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
    const options = {
        method: 'GET',
        uri: 'https://app.fakturoid.cz/api/v2/accounts/' + FACTUROID_COMPANY + '/subjects.json',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': FACTUROID_COMPANY
        },
        auth: {
            'user': `${functions.config().fakturoid.login}`,
            'pass': `${functions.config().fakturoid.key}`
        }
    };
    return rp(options).then((value) => {
        const facturoidId = findCompany(companyName, value);
        if (facturoidId.length > 0) {
            snap.ref.set({
                facturoidContactFound: true,
                facturoidContactId: facturoidId
            });
        } else {
            const requestoption = {
                method: 'POST',
                uri: 'https://app.fakturoid.cz/api/v2/accounts/' + FACTUROID_COMPANY + '/subjects.json',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': FACTUROID_COMPANY
                },
                auth: {
                    'user': `${functions.config().fakturoid.login}`,
                    'pass': `${functions.config().fakturoid.key}`
                },
                body: {
                    "custom_id": id,
                    "name": companyName,
                    "street": street,
                    "street2": null,
                    "city": city,
                    "zip": zip,
                    "country": country,
                    "registration_no": registrationNumberIC,
                    "vat_no": registrationNumberDIC,
                    "bank_account": "",
                    "iban": "",
                    "variable_symbol": "",
                    "full_name": "",
                    "email": email,
                    "email_copy": email,
                    "phone": "",
                    "web": ""
                },
                json: true
            };
            return rp(requestoption).then((createValue) => {
                const newId = createValue.id;
                snap.ref.set({
                    facturoidContactFound: true,
                    facturoidContactId: newId
                });
            });
        };
    });

});

export const invoiceCreateInvoice = functions.firestore.document('invoices/{invoiceId}').onUpdate((snap, context) => {
    const newValue = snap.after.data();
    const id = context.params.invoiceId;
    const fakturoidId = newValue.facturoidContactId;
    const countTickets = newValue.countTickets;
    if (newValue.facturoidContactFound === true) {
        const options = {
            method: 'POST',
            uri: 'https://app.fakturoid.cz/api/v2/accounts/' + FACTUROID_COMPANY + '/invoices.json',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': FACTUROID_COMPANY
            },
            auth: {
                'user': `${functions.config().fakturoid.login}`,
                'pass': `${functions.config().fakturoid.key}`
            },
            body: {
                "subject_id": fakturoidId,
                "currency": "EUR",
                "payment_method": "bank",
                "due": 7,
                "lines": [
                    {
                        "name": "Devfest 2018 ticket",
                        "quantity": countTickets,
                        "unit_name": "number",
                        "unit_price": "20",
                        "vat_rate": "21"
                    }
                ]
            },
            json: true
        };
        return rp(options).then((createValue) => {
            // TODO - send invoice
        });
    } else {
        return true;
    }
});

function findCompany(name, body) {
    const list = JSON.parse(body);
    let foundId = '';
    list.forEach(element => {
        if (element.name === name) {
            foundId = element.id;
        }
    });
    return foundId;
}