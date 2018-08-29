import * as rp from 'request-promise';
import * as functions from 'firebase-functions';

export async function generateTitoCode(companyName, id, countTickets: string) {
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
          "code": (companyName + "-" + id),
          "discount_code_type": "PercentOffDiscountCode",
          "value": "100.00",
          "quantity": countTickets
        }
      }
    },
    json: true
  }
  const discount = await rp(options);
  return discount.data.attributes.code;
}

export async function getActualPriceCompanyFunded() {

}