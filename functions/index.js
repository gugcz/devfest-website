const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('request');
const cors = require('cors')({ origin: true });
const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const mkdirp = require('mkdirp-promise');
const fs = require('fs');
const rp = require('request-promise');

// Max height and width of the thumbnail in pixels.
const THUMB_MAX_HEIGHT = 50;
const THUMB_MAX_WIDTH = 50;
// Thumbnail prefix added to file names.
const THUMB_PREFIX = 'thumb_';

const FACTUROID_COMPANY = 'vaclavpavlicek';

admin.initializeApp(functions.config().firebase);

exports.generateThumbnailMediaGraphics = functions.storage.object().onFinalize((object) => {
    const filePath = object.name;
    const contentType = object.contentType;
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const thumbFilePath = path.normalize(path.join(fileDir, `${THUMB_PREFIX}${fileName}`));
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile);
    const tempLocalThumbFile = path.join(os.tmpdir(), thumbFilePath);
    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
        console.log('This is not an image.');
        return null;
    }
    if (!filePath.startsWith('mediaGraphics/')) {
        console.log('This is not an mediaGraphics image.');
        return null;
    }
    if (fileName.startsWith(THUMB_PREFIX)) {
        console.log('Already a Thumbnail.');
        return null;
    }
    const bucket = gcs.bucket(object.bucket);
    const file = bucket.file(filePath);
    const thumbFile = bucket.file(thumbFilePath);
    const metadata = {
        contentType: contentType,
    };
    return mkdirp(tempLocalDir).then(() => {
        return file.download({ destination: tempLocalFile });
    }).then(() => {
        return spawn('convert', [tempLocalFile, '-thumbnail', `${THUMB_MAX_WIDTH}x${THUMB_MAX_HEIGHT}>`, tempLocalThumbFile], { capture: ['stdout', 'stderr'] });
    }).then(() => {
        return bucket.upload(tempLocalThumbFile, { destination: thumbFilePath, metadata: metadata });
    }).then(() => {
        fs.unlinkSync(tempLocalFile);
        fs.unlinkSync(tempLocalThumbFile);
        const config = {
            action: 'read',
            expires: '03-01-2500',
        };
        return thumbFile.getSignedUrl(config);
    })
});


exports.getTickets = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const options = {
            url: 'https://api.tito.io/v2/devfest-cz/2018/releases',
            headers: {
                'Authorization': `Token token=${functions.config().tito.key}`,
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/json'
            }
        };
        request.get(options, (error, response, body) => {
            res.send(processTickets(JSON.parse(body)));
        });
    });
});

exports.invoiceFindContact = functions.firestore.document('invoices/{invoiceId}').onCreate((snap, context) => {
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
            const options = {
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
            return rp(options).then((createValue) => {
                const newId = createValue.id;
                snap.ref.set({
                    facturoidContactFound: true,
                    facturoidContactId: newId
                });
            });
        };
    });

});

exports.invoiceCreateInvoice = functions.firestore.document('invoices/{invoiceId}').onUpdate((snap, context) => {
    const newValue = snap.after.data();
    const id = context.params.invoiceId;
    const fakturoidId = newValue.facturoidContactId;
    const countTickets = newValue.countTickets;
    if (facturoidContactFound == true) {
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
        if (element.name == name) {
            foundId = element.id;
        }
    });
    return foundId;
}

function processTickets(body) {
    const superEarlyBird = body.data.filter(it => it.attributes.title === 'Super early bird');
    const earlyBirds = body.data.filter(it => it.attributes.title === 'Early bird - Student/Diversity'
        || it.attributes.title === 'Early bird - Individual' || it.attributes.title === 'Early bird - Company funded');
    const regular = body.data.filter(it => it.attributes.title === 'Student/Diversity'
        || it.attributes.title === 'Individual' || it.attributes.title === 'Company funded');
    const lazyBirds = body.data.filter(it => it.attributes.title === 'Lazy bird - Student/Diversity'
        || it.attributes.title === 'Lazy bird - Individual' || it.attributes.title === 'Lazy bird - Company funded');
    const communitySupport = body.data.filter(it => it.attributes.title === 'Community Support');
    return [mergeTickets(superEarlyBird), mergeTickets(earlyBirds), mergeTickets(regular), mergeTickets(lazyBirds), mergeTickets(communitySupport)];
}

function mergeTickets(tickets) {
    if (tickets.length > 1) {
        const individualTicket = tickets.filter(it => it.attributes.title.indexOf('Individual') !== -1)[0];
        const studentTicket = tickets.filter(it => it.attributes.title.indexOf('Student') !== -1)[0];
        const companyTicket = tickets.filter(it => it.attributes.title.indexOf('Company funded') !== -1)[0];
        const individualPrice = { price: individualTicket.attributes.price, title: 'Individual' };
        const companyPrice = { price: companyTicket.attributes.price, title: 'Company funded' };
        const studentPrice = { price: studentTicket.attributes.price, title: 'Student' };
        const prices = [individualPrice, companyPrice, studentPrice];
        const basicTitle = individualTicket.attributes.title.substring(0, individualTicket.attributes.title.indexOf('-') - 1) || 'Regular';
        let description = '';
        if (tickets[0].attributes['title'] == 'Early bird - Individual' || tickets[0].attributes['title'] == 'Early bird - Student/Diversity' || tickets[0].attributes['title'] == 'Early bird - Company funded') {
            description = 'First 100';
        } else if (tickets[0].attributes['title'] == 'Individual' || tickets[0].attributes['title'] == 'Student/Diversity' || tickets[0].attributes['title'] == 'Company funded') {
            description = 'Until 11th October';
        } else if (tickets[0].attributes['title'] == 'Lazy bird - Company funded' || tickets[0].attributes['title'] == 'Lazy bird - Individual' || tickets[0].attributes['title'] == 'Lazy bird - Student/Diversity') {
            description = 'From 12th October';
        }
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const startDate = new Date(individualTicket.attributes['start-at']);
        const endDate = new Date(individualTicket.attributes['end-at']);
        const state = individualTicket.attributes['state'];
        return {
            actual: ((state === 'on_sale') && (now >= startDate && now <= endDate)),
            description: description,
            price: prices,
            order: 1,
            soldOut: false,
            title: basicTitle,
            support: false
        };
    } else if (tickets[0].attributes.title === 'Community Support') {
        const supportTicket = tickets[0];
        const price = { price: supportTicket.attributes['price'], title: 'I ♥︎ DevFest' };
        const prices = [price];
        return {
            actual: supportTicket.attributes['state'] === 'on_sale',
            description: 'You want to support community',
            price: prices,
            order: 1,
            soldOut: false,
            title: 'Community Support',
            support: true,
            url: 'https://ti.to/devfest-cz/2018/with/w65mf5epnjg'
        };
    } else if (tickets[0].attributes.title === 'Super early bird') {
        const oneTicket = tickets[0];
        const price = { price: oneTicket.attributes['price'], title: 'Individual' };
        const prices = [price];
        const quantity = oneTicket.attributes['quantity'];
        return {
            actual: oneTicket.attributes['state'] === 'on_sale',
            description: `First ${quantity}`,
            price: prices,
            order: 1,
            soldOut: oneTicket.attributes['quantity-sold'] === oneTicket.attributes['quantity'],
            title: 'Super early<br>bird',
            support: false,
            url: 'https://ti.to/devfest-cz/2018/with/oc0cuxocymm'
        };
    }
}
