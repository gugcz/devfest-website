const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('request');
const cors = require('cors')({origin: true});
const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const mkdirp = require('mkdirp-promise');
const fs = require('fs');

// Max height and width of the thumbnail in pixels.
const THUMB_MAX_HEIGHT = 50;
const THUMB_MAX_WIDTH = 50;
// Thumbnail prefix added to file names.
const THUMB_PREFIX = 'thumb_';

admin.initializeApp(functions.config().firebase);

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
        return file.download({destination: tempLocalFile});
    }).then(() => {
        return spawn('convert', [tempLocalFile, '-thumbnail', `${THUMB_MAX_WIDTH}x${THUMB_MAX_HEIGHT}>`, tempLocalThumbFile], {capture: ['stdout', 'stderr']});
    }).then(() => {
        return bucket.upload(tempLocalThumbFile, {destination: thumbFilePath, metadata: metadata});
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

function processTickets(body) {
    const superEarlyBird = body.data.filter(it => it.attributes.title === 'Super early bird');
    const earlyBirds = body.data.filter(it => it.attributes.title === 'Early bird - Student/Diversity'
        || it.attributes.title === 'Early bird - Individual' || it.attributes.title === 'Early bird - Company funded');
    const regular = body.data.filter(it => it.attributes.title === 'Student/Diversity'
        || it.attributes.title === 'Individual' || it.attributes.title === 'Company funded');
    const lazyBirds = body.data.filter(it => it.attributes.title === 'Lazy bird - Student/Diversity'
        || it.attributes.title === 'Lazy bird - Individual' || it.attributes.title === 'Lazy bird - Company funded');
    const vip = body.data.filter(it => it.attributes.title === 'Community Support');
    return [mergeTickets(superEarlyBird), mergeTickets(earlyBirds), mergeTickets(regular), mergeTickets(lazyBirds), mergeTickets(vip)];
}

function mergeTickets(tickets) {
    if (tickets.length > 1) {
        const individualTicket = tickets.filter(it => it.attributes.title.indexOf('Individual') !== -1)[0];
        const studentTicket = tickets.filter(it => it.attributes.title.indexOf('Student') !== -1)[0];
        const companyTicket = tickets.filter(it => it.attributes.title.indexOf('Company funded') !== -1)[0];
        const individualPrice = {price: individualTicket.attributes.price, title: 'Individual'};
        const companyPrice = {price: companyTicket.attributes.price, title: 'Company funded'};
        const studentPrice = {price: studentTicket.attributes.price, title: 'Student'};
        const prices = [individualPrice, companyPrice, studentPrice];
        const basicTitle = individualTicket.attributes.title.substring(0, individualTicket.attributes.title.indexOf('-') - 1) || 'Regular';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const startDate = new Date(individualTicket.attributes['start-at']);
        const endDate = new Date(individualTicket.attributes['end-at']);
        const quantity = individualTicket.attributes.quantity + studentTicket.attributes.quantity + companyTicket.attributes.quantity;
        return {
            actual: now >= startDate && now <= endDate,
            description: ``,
            price: prices,
            order: 1,
            soldOut: false,
            title: basicTitle,
            support: false
        };
    } else if (tickets[0].attributes.title === 'Community Support') {
        const supportTicket = tickets[0];
        const price = {price: supportTicket.attributes.price, title: 'Support'};
        const prices = [price];
        return {
            actual: supportTicket.attributes.state === 'on_sale',
            description: 'You want to support community',
            price: prices,
            order: 1,
            soldOut: false,
            title: 'Community Support',
            support: true
        };
    } else if (tickets[0].attributes.title === 'Super early bird') {
        const oneTicket = tickets[0];
        const price = {price: oneTicket.attributes.price, title: 'Individual'};
        const prices = [price];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const startDate = new Date(oneTicket.attributes['start-at']);
        const endDate = new Date(oneTicket.attributes['end-at']);
        const quantity = oneTicket.attributes.quantity;
        return {
            actual: now >= startDate && now <= endDate,
            description: `First 30`,
            price: prices,
            order: 1,
            soldOut: false,
            title: 'Super early bird',
            support: false
        };
    }
}
