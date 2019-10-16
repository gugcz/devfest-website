import * as functions from 'firebase-functions';

import * as helpers from './helpers';
import * as tito from './tito';

export const getTickets = functions.https.onCall((_req, _res) => {
  return tito
    .getTicketsFromTito()
    .then(data => {
      return helpers.processTicketBody(data['releases']);
    })
    .then(tickets => {
      return tickets;
    })
    .catch(error => {
      console.error('Error in processing tickets');
      throw error;
    });
});

export const getCurrentTicketsForInvoice = functions.https.onCall(
  (_req, _res) => {
    return tito
      .findCurrentTicketsForInvoice()
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error('Error in getting company ticket');
        throw error;
      });
  }
);

export const registeredNewTicket = functions.https.onRequest((req, res) => {
  const data = req.body;
  const name = data.name;
  const ticketsInfo = data.line_items.map(
    tic => tic.quantity + 'x ' + tic.release_title
  );
  return tito
    .getCurrentSoldTickets()
    .then(current => {
      const slackMessage = {
        text: 'Registrované nové lístky :ticket:',
        attachments: [
          {
            fields: [
              {
                title: 'Jméno',
                value: name,
              },
              {
                title: 'Seznam lístků',
                value: ticketsInfo.join('\n'),
              },
            ],
            color: '#7da453',
          },
          {
            title: 'Celkově prodaných lístků',
            text: current.toString(),
            color: '#333',
          },
        ],
      };
      return helpers.sendInfoIntoSlack(slackMessage);
    })
    .then(() => {
      return res.status(200).send(true);
    })
    .catch(error => {
      console.error('Error informing about registered new ticket');
      throw error;
    });
});
