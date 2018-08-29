import * as functions from 'firebase-functions';
import * as rp from 'request-promise';

const FACTUROID_COMPANY = 'gug';

interface Company {
    firebaseId: string;
    name: string;
    email: string;
    street: string;
    city: string;
    zip: string;
    registrationNumberIC: string;
    registrationNumberDIC: string;
    country: string;
}

interface Invoice {
    id: string;
    variableSymbol: string;
}

/**
 * Nalezení firmy ve fakturoidu
 * Vrací id firmy
 * @param companyName 
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
    let foundId = null;
    listCompanies.forEach(element => {
        if (element.name === companyName) {
            foundId = element.id;
        }
    });
    return foundId;
}

/**
 * Vytvoření ve fakturoidu
 * Vrací id nové firmy
 * @param company 
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
 * Vytvoření faktury
 * @param fakturoidID Id firmy ve fakturoidu
 * @param countTickets počet tickets
 */
export async function createInvoice(fakturoidID, countTickets) {
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
            "currency": "EUR",
            "payment_method": "bank",
            "due": 7,
            "lines": [
                {
                    "name": "Devfest 2018 ticket",
                    "quantity": countTickets,
                    "unit_name": "number",
                    "unit_price": "20",
                    "vat_rate": "21"
                }
            ]
        },
        json: true
    };
    const data = await rp(options)
    const invoice: Invoice = {id: data.id, variableSymbol: data.variable_symbol};
    return invoice;
}

/**
 * Stažení pdf 
 * @param invoiceId Id faktury ve fakturoidu
 */
export async function downloadInvoiceById(invoiceId: string){
    const options = {
        method: 'GET',
        uri: 'https://app.fakturoid.cz/api/v2/accounts/' + FACTUROID_COMPANY + '/invoices/' + invoiceId + '/download.pdf',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': FACTUROID_COMPANY
        },
        auth: {
            'user': `${functions.config().fakturoid.login}`,
            'pass': `${functions.config().fakturoid.key}`
        }
    };
    const data = await rp(options)
    return new Buffer(data).toString('base64');
}