import {Component, OnInit} from '@angular/core';
import {Price, Ticket} from '../../database/ticket';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {

  response: Object;
  tickets: Ticket[];

  constructor(private http: HttpClient, private fireStore: AngularFirestore) {
  }

  ngOnInit() {
    const headers = {
      headers: new HttpHeaders({
        'Authorization': 'Token token=6z4GwhHNVrcudVCCJnTD',
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/vnd.api+json'
      })
    };
    this.response = {
      'data': [
        {
          'id': 'xjaysgfaphe',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': 'Bla bla early bird bla bla',
            'enable-super-combo-summary': true,
            'end-at': '2018-07-20T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 1,
            'price': '10.00',
            'quantity': 32,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': false,
            'secret': false,
            'start-at': '2018-05-25T18:24:57.000Z',
            'state': 'on_sale',
            'success-message': null,
            'title': 'Early bird – Individual',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/releases/xjaysgfaphe'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/questions?filter[release]=xjaysgfaphe'
              }
            }
          }
        },
        {
          'id': 'oq3tsbqqgs8',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': null,
            'enable-super-combo-summary': true,
            'end-at': '2018-07-20T12:00:00.000Z',
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 2,
            'price': '20.00',
            'quantity': null,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': false,
            'secret': false,
            'start-at': '2018-05-26T07:03:19.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Regular – Student',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/releases/oq3tsbqqgs8'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/questions?filter[release]=oq3tsbqqgs8'
              }
            }
          }
        },
        {
          'id': 'svdj8nw5r28',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': null,
            'enable-super-combo-summary': true,
            'end-at': null,
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 3,
            'price': '5.00',
            'quantity': null,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': false,
            'secret': false,
            'start-at': '2018-06-01T17:09:03.000Z',
            'state': 'on_sale',
            'success-message': null,
            'title': 'Early bird – Student',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/releases/svdj8nw5r28'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/questions?filter[release]=svdj8nw5r28'
              }
            }
          }
        },
        {
          'id': '8v7e9y4oia8',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': 'Company bla bla',
            'enable-super-combo-summary': true,
            'end-at': null,
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 4,
            'price': '20.00',
            'quantity': null,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': false,
            'secret': false,
            'start-at': '2018-06-01T17:09:37.000Z',
            'state': 'on_sale',
            'success-message': null,
            'title': 'Early bird – Company',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/releases/8v7e9y4oia8'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/questions?filter[release]=8v7e9y4oia8'
              }
            }
          }
        },
        {
          'id': 'k7bcuaqa3jo',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': null,
            'enable-super-combo-summary': true,
            'end-at': null,
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 5,
            'price': '40.00',
            'quantity': null,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': false,
            'secret': false,
            'start-at': '2018-06-01T18:09:39.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Regular – Individual',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/releases/k7bcuaqa3jo'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/questions?filter[release]=k7bcuaqa3jo'
              }
            }
          }
        },
        {
          'id': 'nbjpcwhbyhm',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': null,
            'enable-super-combo-summary': true,
            'end-at': null,
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 6,
            'price': '50.00',
            'quantity': null,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': false,
            'secret': false,
            'start-at': '2018-06-01T18:09:58.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Regular – Company',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/releases/nbjpcwhbyhm'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/questions?filter[release]=nbjpcwhbyhm'
              }
            }
          }
        },
        {
          'id': 'qlgwoxhqoi4',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': null,
            'enable-super-combo-summary': true,
            'end-at': null,
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 7,
            'price': '50.00',
            'quantity': null,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': false,
            'secret': false,
            'start-at': '2018-06-01T18:10:19.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Lazy bird  – Student',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/releases/qlgwoxhqoi4'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/questions?filter[release]=qlgwoxhqoi4'
              }
            }
          }
        },
        {
          'id': 'cwkc3qepchs',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': null,
            'enable-super-combo-summary': true,
            'end-at': null,
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 8,
            'price': '60.00',
            'quantity': null,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': false,
            'secret': false,
            'start-at': '2018-06-01T18:10:45.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Lazy bird  – Individual',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/releases/cwkc3qepchs'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/questions?filter[release]=cwkc3qepchs'
              }
            }
          }
        },
        {
          'id': 'rvxkxc-x9qa',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': null,
            'enable-super-combo-summary': true,
            'end-at': null,
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 9,
            'price': '70.00',
            'quantity': null,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': false,
            'secret': false,
            'start-at': '2018-06-01T18:11:10.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'Lazy bird  – Company',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/releases/rvxkxc-x9qa'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/questions?filter[release]=rvxkxc-x9qa'
              }
            }
          }
        },
        {
          'id': '9kuw4scryeq',
          'type': 'releases',
          'attributes': {
            'archived': false,
            'default-quantity': 0,
            'description': null,
            'enable-super-combo-summary': true,
            'end-at': null,
            'fail-message': null,
            'has-fail-message': false,
            'has-success-message': false,
            'max-tickets-per-person': null,
            'min-tickets-per-person': null,
            'not-a-ticket': false,
            'position': 10,
            'price': '200.00',
            'quantity': null,
            'quantity-sold': 0,
            'question-ids': [],
            'request-company-name': null,
            'request-vat-number': null,
            'require-billing-address': null,
            'require-credit-card-for-sold-out-waiting-list': false,
            'require-email': true,
            'require-name': false,
            'secret': false,
            'start-at': '2018-06-01T18:11:34.000Z',
            'state': 'off_sale',
            'success-message': null,
            'title': 'I ♥ DevFest',
            'waiting-list-enabled-during-sold-out': false
          },
          'links': {
            'self': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/releases/9kuw4scryeq'
          },
          'relationships': {
            'questions': {
              'links': {
                'related': 'https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/questions?filter[release]=9kuw4scryeq'
              }
            }
          }
        }
      ]
    };
    this.joinTickets();
  }

  joinTickets() {
    const foundTitles = [];
    this.tickets = [];
    this.response['data'].forEach(ticket => {
      const basicTitle = ticket['attributes']['title'].substring(0, ticket['attributes']['title'].indexOf('–') - 1) || ticket['attributes']['title'];
      if (foundTitles.indexOf(basicTitle) === -1) {
        const sameTickets = this.response['data'].filter(ticketFltr => ticketFltr['attributes']['title'].indexOf(basicTitle) !== -1);
        if (sameTickets.length > 1) {
          const individualTicket = sameTickets.filter(ticketFltr => ticketFltr['attributes']['title'].indexOf('Individual') !== -1)[0];
          const studentTicket = sameTickets.filter(ticketFltr => ticketFltr['attributes']['title'].indexOf('Student') !== -1)[0];
          const companyTicket = sameTickets.filter(ticketFltr => ticketFltr['attributes']['title'].indexOf('Company') !== -1)[0];
          const individualPrice: Price = {price: individualTicket['attributes']['price'], title: 'Individual'};
          const companyPrice: Price = {price: companyTicket['attributes']['price'], title: 'Company'};
          const studentPrice: Price = {price: studentTicket['attributes']['price'], title: 'Student'};
          const prices = [individualPrice, companyPrice, studentPrice];
          const joinedTicket: Ticket = {
            actual: individualTicket['attributes']['state'] === 'on_sale',
            description: individualTicket['attributes']['description'],
            price: prices,
            order: 1,
            soldOut: false,
            title: basicTitle,
            support: false
          };
          this.tickets.push(joinedTicket);
        } else {
          const supportTicket = sameTickets[0];
          const price: Price = {price: supportTicket['attributes']['price'], title: 'Support'};
          const prices = [price];
          const joinedTicket: Ticket = {
            actual: supportTicket['attributes']['state'] === 'on_sale',
            description: supportTicket['attributes']['description'],
            price: prices,
            order: 1,
            soldOut: false,
            title: basicTitle,
            support: true
          };
          this.tickets.push(joinedTicket);
        }
        foundTitles.push(basicTitle);
      }
    });
  }

}
