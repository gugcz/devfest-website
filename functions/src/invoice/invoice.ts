import * as admin from 'firebase-admin';
import * as rp from 'request-promise';

/**
 * Setting invoice in firestore as paid
 * @param fakturoidId - id of facturoid invoice
 * @param paid - ammount of paid
 * @return Promise<boolean>
 */
export async function setFakturoidInvoicePaid(fakturoidId: string, paid: string) {
  const snapshot = await admin.firestore().collection('invoices').where('faktruoidInvoiceId', '==', fakturoidId).get();
  if (snapshot.empty) {
    return false;
  } else {
    await snapshot.docs[0].ref.update({
      fakturoidInvoicePaid: true,
      fakturoidInvoicePaidAmmount: paid
    });
    return true;
  }
}

/**
 * Get current exchange rate
 * @param from - from what currency
 * @param to - to what currency
 * @return Promise<number> - exchange rate
 */
export async function getCurrentExchangeRate(from: string, to: string){
  const options = {
    method: 'GET',
    uri: 'https://api.exchangeratesapi.io/latest?base=' + from,
    json: true
  };
  const data = await rp(options);
  return data['rates'][to];
}
