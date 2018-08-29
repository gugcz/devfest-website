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