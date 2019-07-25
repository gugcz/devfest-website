import * as functions from 'firebase-functions';
import * as slugify from 'slugify';
import * as rp from 'request-promise';
import * as helpers from './helpers';

/**
 * Generating code in tito
 * @param companyName - name of company
 * @param id - id of process
 * @param countTickets - number of tickets
 */
export async function generateTitoCode(companyName, id, countTickets: number, countTicketsVip: number): Promise<string> {
    const postCompanyName = slugify.default(companyName).toLowerCase();
    const invoiceTickets = await findCurrentTicketsForInvoice();
    const completePrice = invoiceTickets.normal.price*countTickets + invoiceTickets.vip.price*countTicketsVip;
    const ids = [invoiceTickets.normal.id,invoiceTickets.vip.id];
    const options = {
      method: 'POST',
      url: functions.config().tito.discount ,
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
              "type": "MoneyOffDiscountCode",
              "value": completePrice,
              "quantity": 1,
              "only-show-attached": true,
              "release-ids": ids
            }
        }
      },
      json: true
    };
    const discount = await rp(options);
    return discount.data.attributes.code;
}

/**
 * Download all informations about tickets from tito
 */
export async function getTicketsFromTito(): Promise<Object> {
    const options = {
        method: 'GET',
        json: true,
        uri: functions.config().tito.url,
        headers: {
            'Authorization': `Token token=${functions.config().tito.key}`,
            'Accept': 'application/json'
        }
    }
    const data = await rp(options);
    return data;
}

/**
 * Retrieves current count of tickets
 */
export async function getCurrentSoldTickets() {
    const ticketsData = await getTicketsFromTito();
    const sum = ticketsData['releases'].map(a => a.tickets_count).reduce(getSum);
    return sum;
}

function getSum(total, ticket) {
    return total + ticket;
}


/**
 * Returns current tickets for invoice (Latest company and VIP)
 */
export async function findCurrentTicketsForInvoice() {
    const ticketsData = await getTicketsFromTito();
    const processedTickets = await helpers.processTicketBody(ticketsData['releases']);
    const onlyActiveCompany = processedTickets.filter(ticket => ticket.active === true && ticket.title.toUpperCase().includes('COMPANY'));
    const onlyActiveVIP = processedTickets.filter(ticket => ticket.active === true && ticket.title.toUpperCase().includes('COMMUNITY SUPPORT'));
    return {
        normal: onlyActiveCompany[onlyActiveCompany.length - 1],
        vip: onlyActiveVIP[onlyActiveVIP.length - 1]
    };
}

