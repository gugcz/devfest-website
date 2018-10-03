import * as functions from 'firebase-functions';

const request = require('request');
const cors = require('cors')({ origin: true });

export const getTickets = functions.https.onRequest((req, res) => {
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
        if (tickets[0].attributes['title'] === 'Early bird - Individual' || tickets[0].attributes['title'] === 'Early bird - Student/Diversity' || tickets[0].attributes['title'] === 'Early bird - Company funded') {
            description = 'First 100';
        } else if (tickets[0].attributes['title'] === 'Individual' || tickets[0].attributes['title'] === 'Student/Diversity' || tickets[0].attributes['title'] === 'Company funded') {
            description = 'Until 11th October';
        } else if (tickets[0].attributes['title'] === 'Lazy bird - Company funded' || tickets[0].attributes['title'] === 'Lazy bird - Individual' || tickets[0].attributes['title'] === 'Lazy bird - Student/Diversity') {
            description = 'From 12th October';
        }
        //const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const startDate = new Date(individualTicket.attributes['start-at']);
        const endDate = new Date(individualTicket.attributes['end-at']);
        const state = individualTicket.attributes['state'];
        const sold = (individualTicket.attributes['quantity'] === individualTicket.attributes['quantity-sold']);
        return {
            actual: ((state === 'on_sale') && (now >= startDate && now <= endDate)),
            description: description,
            price: prices,
            order: 1,
            soldOut: sold,
            title: basicTitle,
            support: false,
            url: 'https://ti.to/devfest-cz/2018/'
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
        const now = new Date();
        const startDate = new Date(oneTicket.attributes['start-at']);
        const endDate = new Date(oneTicket.attributes['end-at']);
        const state = oneTicket.attributes['state'];
        return {
            actual:  ((state === 'on_sale') && (now >= startDate && now <= endDate)),
            description: `First ${quantity}`,
            price: prices,
            order: 1,
            soldOut: oneTicket.attributes['quantity-sold'] === oneTicket.attributes['quantity'],
            title: 'Super early<br>bird',
            support: false,
            url: 'https://ti.to/devfest-cz/2018/with/oc0cuxocymm'
        };
    } else {
        return null;
    }
}
