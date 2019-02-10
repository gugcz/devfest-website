import * as rp from 'request-promise';

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