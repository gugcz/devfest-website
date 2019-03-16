import * as rp from 'request-promise';
import * as functions from 'firebase-functions';


/**
* Get current exchange rate
* @param from - from what currency
* @param to - to what currency
* @return Promise<number> - exchange rate
*/
export async function getCurrentExchangeRate(from, to) {
    const options = {
        method: 'GET',
        uri: 'https://api.exchangeratesapi.io/latest?base=' + from,
        json: true
    };
    const data = await rp(options);
    return data['rates'][to];
}

export async function sendInfoIntoSlack(message){
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