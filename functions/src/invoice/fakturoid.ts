import * as functions from 'firebase-functions';
import * as rp from 'request-promise';
import * as tito from './tito';
import * as fireInvoice from './invoice';

const FACTUROID_COMPANY = 'gug';

interface Company {
    firebaseId: string;
    name: string;
    email: string;
    street: string;
    city: string;
    zip: string;
    registrationNumberIC: string;
    registrationNumberDIC?: string;
    country: string;
}

interface Invoice {
    id: string;
    variableSymbol: string;
}

/**
 * Find company in facturoid
 * @param companyName
 * @return Promise<string> - id of facturoid company
 */
export async function findFaktruoidCompanyId(companyName?: string) {
    const options = {
        method: 'GET',
        uri: 'https://app.fakturoid.cz/api/v2/accounts/' + FACTUROID_COMPANY + '/subjects.json',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': FACTUROID_COMPANY
        },
        auth: {
            'user': `${functions.config().fakturoid.login}`,
            'pass': `${functions.config().fakturoid.key}`
        }
    };
    const fakturoidCompanies = await rp(options);
    const listCompanies = JSON.parse(fakturoidCompanies);
  const foundCompanies = listCompanies.filter(a => a.name === companyName);
  return foundCompanies.length > 0 ? foundCompanies[0].id : null;
}

/**
 * Creating company in facturoid
 * @param company
 * @return Promise<string> - id of company
 */
export async function createFakturoidCompany(company: Company) {
    const options = {
        method: 'POST',
        uri: 'https://app.fakturoid.cz/api/v2/accounts/' + FACTUROID_COMPANY + '/subjects.json',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': FACTUROID_COMPANY
        },
        auth: {
            'user': `${functions.config().fakturoid.login}`,
            'pass': `${functions.config().fakturoid.key}`
        },
        body: {
            "custom_id": company.firebaseId,
            "name": company.name,
            "street": company.street,
            "street2": null,
            "city": company.city,
            "zip": company.zip,
            "country": company.country,
            "registration_no": company.registrationNumberIC,
            "vat_no": company.registrationNumberDIC,
            "bank_account": "",
            "iban": "",
            "variable_symbol": "",
            "full_name": "",
            "email": company.email,
            "email_copy": company.email,
            "phone": "",
            "web": ""
        },
        json: true
    };
    const newCompany = await rp(options);
    return newCompany.id;
}

/**
 * Creating invoice
 * @param fakturoidID - id of company in facturoid
 * @param countTickets - number of tickets he wanna buy
 * @return Promise<Invoice> - complete inovice info
 */
export async function createInvoice(fakturoidID, countTickets) {
    const EUR_CZK = await fireInvoice.getCurrentExchangeRate('EUR', 'CZK');
    const priceOne = await tito.getActualPriceCompanyFunded();
    const price = parseInt(priceOne) * EUR_CZK;
    const options = {
        method: 'POST',
        uri: 'https://app.fakturoid.cz/api/v2/accounts/' + FACTUROID_COMPANY + '/invoices.json',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': FACTUROID_COMPANY
        },
        auth: {
            'user': `${functions.config().fakturoid.login}`,
            'pass': `${functions.config().fakturoid.key}`
        },
        body: {
            "subject_id": fakturoidID,
            "currency": "CZK",
            "payment_method": "bank",
            "lines": [
                {
                    "name": "Devfest 2018",
                    "quantity": countTickets,
                    "unit_name": "tickets",
                    "unit_price": (price / 1.21),
                    "vat_rate": "21"
                }
            ]
        },
        json: true
    };
  const data = await rp(options);
  return {id: data.id, variableSymbol: data.variable_symbol};
}

/**
 * Download invoice pdf
 * @param invoiceId - id of invoice in facturoid
 * @return Promise<string> - base64 pdf
 */
export async function downloadInvoiceById(invoiceId: string){
    const options = {
        method: 'GET',
        uri: 'https://app.fakturoid.cz/api/v2/accounts/' + FACTUROID_COMPANY + '/invoices/' + invoiceId + '/download.pdf',
        headers: {
            "Content-type": "application/pdf",
            'User-Agent': FACTUROID_COMPANY
        },
        encoding: null,
        auth: {
            'user': `${functions.config().fakturoid.login}`,
            'pass': `${functions.config().fakturoid.key}`
        }
    };
  const data = await rp(options);
  return data.toString('base64');
}
