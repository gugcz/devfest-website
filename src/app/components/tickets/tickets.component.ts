import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {InvoiceComponent} from '../invoice/invoice.component';
import {animate, style, transition, trigger} from '@angular/animations';
import {Ticket} from '../../customObjects/ticket';
import * as firebase from 'firebase';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
  animations: [trigger('fadeInOut', [
    transition(':enter', [   // :enter is alias to 'void => *'
      style({opacity: 0}),
      animate('500ms', style({opacity: 1}))
    ])
  ])]
})
export class TicketsComponent implements OnInit {

  euroToCrowns: number;
  tickets: Ticket[];
  showSpinner: Boolean;
  ticketsReady: Boolean;
  priceReady: Boolean;

  constructor(private http: HttpClient, public dialog: MatDialog) {
    this.showSpinner = true;
  }

  ngOnInit() {
    this.http.get<Ticket[]>('https://us-central1-devfest-2018-cz.cloudfunctions.net/getTickets').subscribe(data => {
      this.tickets = data;
      this.ticketsReady = true;
      this.checkSpinner();
    });

    const getCurrentExchangeRate = firebase.functions().httpsCallable('invoiceGetCurrentExchangeRate');
    getCurrentExchangeRate({from: 'EUR', to: 'CZK'}).then((result) => {
      this.euroToCrowns = result.data.price;
      this.priceReady = true;
      this.checkSpinner();
    });
  }

  checkSpinner() {
    if (this.priceReady && this.ticketsReady) {
      this.showSpinner = false;
    }
  }

  goToInvoice() {
    this.dialog.open(InvoiceComponent, {
      width: '400px'
    });
  }

}
