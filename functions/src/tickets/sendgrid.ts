import * as sgMail from '@sendgrid/mail';
import * as functions from 'firebase-functions';

sgMail.setApiKey(`${functions.config().sendgrid.key}`);

/**
 * Send pdf invoice on email
 * @param invoice - pdf of invoice
 * @param email - destination
 */
export async function sendInvoiceInEmail(invoice, email: string):Promise<Object> {
  const msg = {
    to: email,
    from: 'devfest@gug.cz',
    templateId: 'd-a01416e455ef4bb3a045ce3cac26b2f0',
    attachments: [
      {
        content: invoice,
        filename: 'invoice.pdf',
        contentType: 'application/pdf'
      }
    ]
  };
  return await sgMail.send(msg);;
}

/**
 * @param discountCode - discount code for sending
 * @param discountLink - discount link for sending
 * @param email - destination
 */
export async function sendDiscountCode(discountCode, discountLink, email: string):Promise<Object> {
  const msg = {
    to: email,
    from: 'devfest@gug.cz',
    templateId: 'd-938d8ea5d35f47009502af862d748720',
    substitutionWrappers: ['{{', '}}'],
    dynamicTemplateData: {
      code: discountCode,
      codeUrl: discountLink
    }
  };
  return await sgMail.send(msg);
}