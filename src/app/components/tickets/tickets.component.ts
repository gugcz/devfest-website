import {Component, OnInit} from '@angular/core';
import {Price, Ticket, TicketDescription} from '../../database/ticket';
import {AngularFirestore} from 'angularfire2/firestore';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {

  response: Object;
  tickets: Ticket[];
  ticketDescriptions: TicketDescription[];
  showSpinner: Boolean;

  constructor(private http: HttpClient, private fireStore: AngularFirestore) {
    this.showSpinner = true;
  }

  ngOnInit() {
    this.fireStore.collection<TicketDescription>('ticketDescriptions').valueChanges().subscribe(data => {
      console.log(data);
      this.ticketDescriptions = data;
      this.processTickets();
      this.showSpinner = false;
    });
    const headers = {
      headers: new HttpHeaders({
        'Authorization': 'Token token=wy-3g2toPzQfsY_5zsCQOw',
        'Accept': 'application/vnd.api+json'
      })
    };

    this.http.get('https://api.tito.io/v2/devfest-cz/2018/releases', headers).toPromise().then(console.log).catch(console.log);

    this.response = {
      'data': [
        {
          'id': 'znyvnv9rzqg',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': 'Eligible for students (student IDs will be checked at registration) and underrepresented groups in tech (women and people with disabilities - ZTP).',
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 1,
            'price': '12.00',
            'quantity': 50,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': false,
            'start-at': '2018-06-01T18:50:04.000Z',
            'state': 'on_sale',
            'success-message': null,
            'title': 'Early bird - Student/Diversity',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/znyvnv9rzqg'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=znyvnv9rzqg'
              }
            }
          }
        },
        {
          'id': 'a-xtdeoz-qu',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 1,
            'description': 'Buy this if you are paying it from your own pocket. If you work at a company, ask them to buy you a company-funded ticket.',
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': 4,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 2,
            'price': '20.00',
            'quantity': 70,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': false,
            'start-at': '2018-06-01T18:50:56.000Z',
            'state': 'on_sale',
            'success-message': null,
            'title': 'Early bird - Individual',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/a-xtdeoz-qu'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=a-xtdeoz-qu'
              }
            }
          }
        },
        {
          'id': 'rwbmvx6zcno',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 1,
            'description': 'Buy this if the ticket is covered by your company. Your company will support community and there will be a company logo on the badges. If you want to skip creating PayPal account, you need to go through US VPN (PayPal limitation) or contact us for an invoice. If you want to buy more than 5 tickets, send us an e-mail to receive a discount.',
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': 1,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 3,
            'price': '48.00',
            'quantity': 20,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': true,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': false,
            'start-at': '2018-06-01T18:51:31.000Z',
            'state': 'on_sale',
            'success-message': null,
            'title': 'Early bird - Company funded',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/rwbmvx6zcno'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=rwbmvx6zcno'
              }
            }
          }
        },
        {
          'id': 'xplrjrskocu',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 1,
            'description': 'Eligible for students (student IDs will be checked at registration) and underrepresented groups in tech (women and people with disabilities - ZTP).',
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': 1,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 5,
            'price': '24.00',
            'quantity': 70,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': false,
            'start-at': '2018-06-01T18:52:24.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Student/Diversity',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/xplrjrskocu'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=xplrjrskocu'
              }
            }
          }
        },
        {
          'id': 'fxdwqfjgpmo',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 1,
            'description': 'Buy this if you are paying it from your own pocket. If you work at a company, ask them to buy you a company-funded ticket.',
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': 4,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 6,
            'price': '40.00',
            'quantity': 120,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': false,
            'start-at': '2018-06-01T18:52:52.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Individual',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/fxdwqfjgpmo'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=fxdwqfjgpmo'
              }
            }
          }
        },
        {
          'id': 'pi2ztnia1pe',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 1,
            'description': 'Buy this if the ticket is covered by your company. Your company will support community and there will be a company logo on the badges. If you want to skip creating PayPal account, you need to go through US VPN (PayPal limitation) or contact us for an invoice. If you want to buy more than 5 tickets, send us an e-mail to receive a discount.',
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': 1,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 7,
            'price': '60.00',
            'quantity': 30,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': true,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': false,
            'start-at': '2018-06-01T18:53:23.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Company funded',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/pi2ztnia1pe'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=pi2ztnia1pe'
              }
            }
          }
        },
        {
          'id': '8glvgmtz-hw',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 1,
            'description': `Become a celebrity! This gives you a unique opportunity to feast at the speakers' dinner on Friday before the event.`,
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': 1,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 8,
            'price': '120.00',
            'quantity': 3,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': false,
            'start-at': '2018-06-01T18:53:46.000Z',
            'state': 'on_sale',
            'success-message': null,
            'title': 'VIP',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/8glvgmtz-hw'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=8glvgmtz-hw'
              }
            }
          }
        },
        {
          'id': '6bhimkp2c6a',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 1,
            'description': 'Eligible for students (student IDs will be checked at registration) and underrepresented groups in tech (women and people with disabilities - ZTP).',
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': 1,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 9,
            'price': '36.00',
            'quantity': 30,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': false,
            'start-at': '2018-06-01T18:54:06.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Lazy bird - Student/Diversity',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/6bhimkp2c6a'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=6bhimkp2c6a'
              }
            }
          }
        },
        {
          'id': 'da5kl-ghmte',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 1,
            'description': 'Buy this if you are paying it from your own pocket. If you work at a company, ask them to buy you a company-funded ticket.',
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': 4,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 10,
            'price': '60.00',
            'quantity': 50,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': false,
            'start-at': '2018-06-01T18:54:27.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Lazy bird - Individual',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/da5kl-ghmte'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=da5kl-ghmte'
              }
            }
          }
        },
        {
          'id': 'vqhclamqjw4',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 1,
            'description': 'Buy this if the ticket is covered by your company. Your company will support community and there will be a company logo on the badges. If you want to skip creating PayPal account, you need to go through US VPN (PayPal limitation) or contact us for an invoice. If you want to buy more than 5 tickets, send us an e-mail to receive a discount.',
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': 1,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 11,
            'price': '80.00',
            'quantity': 25,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': true,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': false,
            'start-at': '2018-06-01T18:55:05.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Lazy bird - Company funded',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/vqhclamqjw4'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=vqhclamqjw4'
              }
            }
          }
        },
        {
          'id': 'nfqkalff9q0',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': 'Thanks for being our speaker! Register here to get your speaker badge.',
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 13,
            'price': null,
            'quantity': 36,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': true,
            'start-at': '2018-06-01T18:55:50.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Speaker ticket',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/nfqkalff9q0'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=nfqkalff9q0'
              }
            }
          }
        },
        {
          'id': 'phy479vy0us',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 1,
            'description': 'Díky za orgování! Vyplň tohle pls a dostaneš ORG badge.',
            'enable-super-combo-summary': true,
            'end-at': '2018-11-10T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': 1,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 14,
            'price': null,
            'quantity': 32,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': true,
            'secret': true,
            'start-at': '2018-06-01T18:56:31.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'ORG ticket',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/devfest-cz/2018/releases/phy479vy0us'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/devfest-cz/2018/questions?filter[release]=phy479vy0us'
              }
            }
          }
        }
      ]
    };
  }

  processTickets() {
    const earlyBirds = this.response['data'].filter(it => it['attributes']['title'] === 'Early bird - Student/Diversity'
      || it['attributes']['title'] === 'Early bird - Individual'
      || it['attributes']['title'] === 'Early bird - Company funded');
    const regular = this.response['data'].filter(it => it['attributes']['title'] === 'Student/Diversity'
      || it['attributes']['title'] === 'Individual' || it['attributes']['title'] === 'Company funded');
    const lazyBirds = this.response['data'].filter(it => it['attributes']['title'] === 'Lazy bird - Student/Diversity'
      || it['attributes']['title'] === 'Lazy bird - Individual'
      || it['attributes']['title'] === 'Lazy bird - Company funded');
    const vip = this.response['data'].filter(it => it['attributes']['title'] === 'VIP');
    this.tickets = [
      this.mergeTickets(earlyBirds), this.mergeTickets(regular), this.mergeTickets(lazyBirds), this.mergeTickets(vip)
    ];
  }

  mergeTickets(tickets) {
    if (tickets.length > 1) {
      const individualTicket = tickets.filter(ticketFltr => ticketFltr['attributes']['title'].indexOf('Individual') !== -1)[0];
      const studentTicket = tickets.filter(ticketFltr => ticketFltr['attributes']['title'].indexOf('Student') !== -1)[0];
      const companyTicket = tickets.filter(ticketFltr => ticketFltr['attributes']['title'].indexOf('Company funded') !== -1)[0];
      const individualPrice: Price = {price: individualTicket['attributes']['price'], title: 'Individual'};
      const companyPrice: Price = {price: companyTicket['attributes']['price'], title: 'Company funded'};
      const studentPrice: Price = {price: studentTicket['attributes']['price'], title: 'Student'};
      const prices = [individualPrice, companyPrice, studentPrice];
      const basicTitle = individualTicket['attributes']['title'].substring(0, individualTicket['attributes']['title'].indexOf('-') - 1) || 'Regular';
      return {
        actual: individualTicket['attributes']['state'] === 'on_sale',
        description: this.getDescription(individualTicket),
        price: prices,
        order: 1,
        soldOut: false,
        title: basicTitle,
        support: false
      };
    } else {
      const supportTicket = tickets[0];
      const price: Price = {price: supportTicket['attributes']['price'], title: 'Support'};
      const prices = [price];
      return {
        actual: supportTicket['attributes']['state'] === 'on_sale',
        description: this.ticketDescriptions.filter(it => it.id === 'vip')[0].text,
        price: prices,
        order: 1,
        soldOut: false,
        title: 'VIP',
        support: true
      };
    }
  }

  getDescription(ticket) {
    if (ticket['attributes']['title'].indexOf('Early') !== -1) {
      return this.ticketDescriptions.filter(it => it.id === 'earlyBird')[0].text;
    } else if (ticket['attributes']['title'].indexOf('Lazy') !== -1) {
      return this.ticketDescriptions.filter(it => it.id === 'lazyBird')[0].text;
    } else {
      return this.ticketDescriptions.filter(it => it.id === 'regular')[0].text;
    }
  }

}
