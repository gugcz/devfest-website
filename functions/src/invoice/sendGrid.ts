import * as functions from 'firebase-functions';
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(`${functions.config().sendgrid.key}`);

/**
 * Send pdf invoice on email
 * @param invoice - pdf of invoice
 * @param email - destination
 * @return Promise<boolean>
 */
export async function sendInvoiceInEmail(invoice, email: string) {
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
  await sgMail.send(msg);
  return true;
}

/**
 * @param discountCode - discount code for sending
 * @param discountLink - discount link for sending
 * @param email - destination
 * @return Promise<boolean>
 */
export async function sendDiscountCode(discountCode, discountLink, email: string) {
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
  await sgMail.send(msg);
  return true;
}
