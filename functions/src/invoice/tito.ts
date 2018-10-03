import * as rp from 'request-promise';
import * as functions from 'firebase-functions';
import * as slugify from 'slugify';

export async function generateTitoCode(companyName, id, countTickets: string) {
  const postCompanyName = slugify.default(companyName).toLowerCase();
  const options = {
    method: 'POST',
    url: 'https://api.tito.io/v2/devfest-cz/2018/discount_codes',
    headers: {
      'Authorization': `Token token=${functions.config().tito.key}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/json'
    },
    body: {
      "data":
      {
        "type": "discount-codes",
        "attributes":
        {
          "code": (postCompanyName + "-" + id),
          "discount_code_type": "PercentOffDiscountCode",
          "value": "100.00",
          "quantity": countTickets,
          "release-ids": await getIdsOfCompanyFunded()
        }
      }
    },
    json: true
  }
  const discount = await rp(options);
  return discount.data.attributes.code;
}

export async function getActualPriceCompanyFunded() {
  const options = {
    method: 'GET',
    url: 'https://api.tito.io/v2/devfest-cz/2018/releases',
    headers: {
      'Authorization': `Token token=${functions.config().tito.key}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/json'
    }
  };
  const releases = JSON.parse(await rp(options));
  const tickets = releases.data;
  const now = new Date();
  const companyTickets = tickets.filter(it => (it.attributes.title.indexOf('Company funded') !== -1));
  const chosen = companyTickets.filter(it => ((it.attributes.state === 'on_sale') && (now >= new Date(it.attributes['start-at']) && now <= new Date(it.attributes['end-at']))));
  const chosenTicket = chosen[chosen.length - 1];
  return chosenTicket.attributes.price;
}

export async function getIdsOfCompanyFunded() {
  const options = {
    method: 'GET',
    url: 'https://api.tito.io/v2/devfest-cz/2018/releases',
    headers: {
      'Authorization': `Token token=${functions.config().tito.key}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/json'
    }
  };
  const releases = JSON.parse(await rp(options));
  const tickets = releases.data;
  const companyTickets = tickets.filter(it => (it.attributes.title.indexOf('Company funded') !== -1));
  const ids = [];
  companyTickets.forEach((oneTicket) => {
    ids.push(oneTicket.id);
  })
  return ids;
}