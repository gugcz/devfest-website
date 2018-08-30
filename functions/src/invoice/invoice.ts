import * as admin from 'firebase-admin';

export async function setFakturoidInvoicePaid(fakturoidId: string, paid: string) {
  const snapshot = await admin.firestore().collection('invoices').where('faktruoidInvoiceId', '==', fakturoidId).get();
  if (snapshot.empty) {
    return false;
  } else {
    await snapshot.docs[0].ref.update({
      fakturoidInvoicePaid: true,
      fakturoidInvoicePaidAmmount: paid
    })
    return true;
  }
}

export async function getCurrentExchangeRate(from: string, to: string){
  const snapshot = await admin.firestore().collection('exchangeRates').where('from', '==', from).where('to', '==', to).limit(1).get();
  if (snapshot.empty) {
    throw Error('Missing exchangeRate');
  } else {
    return snapshot.docs[0].data().price;
  }
}