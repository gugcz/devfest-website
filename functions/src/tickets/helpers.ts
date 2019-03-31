import * as rp from 'request-promise';
import * as functions from 'firebase-functions';

/**
* Get current exchange rate
* @param from - from what currency
* @param to - to what currency
*/
export async function getCurrentExchangeRate(from, to): Promise<number> {
  const options = {
    method: 'GET',
    uri: 'https://api.exchangeratesapi.io/latest?base=' + from,
    json: true
  };
  const data = await rp(options);
  return data['rates'][to];
}

/**
 * Sends message into slack predefined webhook
 * @param message - message in format https://api.slack.com/docs/messages/builder
 */
export async function sendInfoIntoSlack(message): Promise<boolean> {
  const options = {
    method: 'POST',
    uri: functions.config().slack.webhook.url,
    headers: {
      'Content-Type': 'application/json',
    },
    body: message,
    json: true
  };
  await rp(options);
  return true;
}

/**
 * Returns cleaned data for frontend
 * @param ticketData - downloaded releases from tito
 */
export async function processTicketBody(ticketData) {
  const exchange = await getCurrentExchangeRate('CZK', 'EUR');
  const tickets = ticketData.filter(a => a.secret === false).map((a) => {
      return {
          title: a.title,
          price: a.price,
          eur_price: Math.round((a.price * exchange) / 5) * 5,
          active: !a.expired && !a.sold_out && !a.upcoming,
          sold_out: a.expired || a.sold_out,
          start: a.start_at,
          end: a.end_at,
          description: a.description,
          url: a.share_url,
          quantity: a.quantity
      }
  });
  return tickets
}