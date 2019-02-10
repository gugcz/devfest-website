import * as functions from 'firebase-functions';
import * as rp from 'request-promise';

import * as helpers from './helpers';

export const getTickets = functions.https.onCall((req, res) => {
    const options = {
        method: 'GET',
        json: true,
        uri: functions.config().tito.url,
        headers: {
            'Authorization': `Token token=${functions.config().tito.key}`,
            'Accept': 'application/json'
        }
    }
    return rp(options)
        .then((data) => {
            return processTicketBody(data['releases']);
        }).then((tickets) => {
            return tickets;
        }).catch((error) => {
            console.error('Error in processing tickets');
            throw error;
        });
});

async function processTicketBody(ticketData) {
    const exchange = await helpers.getCurrentExchangeRate('CZK', 'EUR');
    const tickets = ticketData.filter(a => a.secret === false).map((a) => {
        return {
            title: a.title,
            price: a.price,
            eur_price: Math.ceil((a.price * exchange) / 5) * 5,
            active: !a.expired && !a.sold_out && !a.upcoming,
            sold_out: a.expired || a.sold_out,
            start: a.start_at,
            end: a.end_at,
            description: a.description,
            url: a.share_url,
        }
    });
    return tickets
}
