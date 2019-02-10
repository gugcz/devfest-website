import * as functions from 'firebase-functions';
import * as rp from 'request-promise';

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
            console.log('Error in processing tickets');
            throw error;
        });
});

async function processTicketBody(ticketData) {
    const exchange = await getCurrentExchangeRate('CZK', 'EUR');
    const tickets = ticketData.filter(a => a.secret === false).map((a) => {
        return {
            title: a.title,
            price: a.price,
            eur_price: Math.ceil((a.price * exchange) / 10) * 10,
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

/**
* Get current exchange rate
* @param from - from what currency
* @param to - to what currency
* @return Promise<number> - exchange rate
*/
async function getCurrentExchangeRate(from, to) {
    const options = {
        method: 'GET',
        uri: 'https://api.exchangeratesapi.io/latest?base=' + from,
        json: true
    };
    const data = await rp(options);
    return data['rates'][to];
}