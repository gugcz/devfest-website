import * as rp from 'request-promise';
import * as functions from 'firebase-functions';
import { Invoice } from './dto/invoice';
import { Company } from './dto/company';
import * as tito from './tito';

const FACTUROID_COMPANY = 'gug';

/**
 * Download invoice pdf
 * @param invoiceId - id of invoice in facturoid
 */
export async function downloadInvoiceById(invoiceId: string): Promise<string> {
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

/**
 * Creating invoice
 * @param fakturoidID - id of company in facturoid
 * @param countTickets - number of tickets he wanna buy
 * @param countTicketsVIP - number of tickets VIP he wanna buy
 * @return Promise<Invoice> - complete inovice info
 */
export async function createInvoice(fakturoidID, countTicketsNormal, countTicketsVIP): Promise<Invoice> {
    const prices = await tito.findCurrentTicketsForInvoice();
    const lines = [];
    if (countTicketsNormal !== null && countTicketsNormal > 0 && prices.normal !== null) {
        lines.push(
            {
                "name": "Devfest 2019 - company tickets",
                "quantity": countTicketsNormal,
                "unit_name": "tickets",
                "unit_price": (prices.normal.price / 1.21),
                "vat_rate": "21"
            }
        )
    }
    if (countTicketsVIP !== null && countTicketsVIP > 0 && prices.vip !== null) {
        lines.push(
            {
                "name": "Devfest 2018 - Support community tickets",
                "quantity": countTicketsVIP,
                "unit_name": "tickets",
                "unit_price": (prices.vip.price / 1.21),
                "vat_rate": "21"
            }
        )
    }
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
            "lines": lines
        },
        json: true
    };
    const data = await rp(options);
    return { id: data.id, variableSymbol: data.variable_symbol };
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
            "vat_no": company.vatNumber,
            "bank_account": "",
            "iban": "",
            "variable_symbohelpers.sendInfoIntoSlack(slackMessage)": "",
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
 * Find company in facturoid
 * @param companyName
 */
export async function findFaktruoidCompanyId(companyName?: string): Promise<string> {
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