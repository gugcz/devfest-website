import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {InvoiceComponent} from '../invoice/invoice.component';
import {animate, style, transition, trigger} from '@angular/animations';
import {Ticket} from '../../customObjects/ticket';

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

  tickets: Ticket[];
  showSpinner: Boolean;

  constructor(private http: HttpClient, public dialog: MatDialog) {
    this.showSpinner = true;
  }

  ngOnInit() {
    this.http.get<Ticket[]>('https://us-central1-devfest-2018-cz.cloudfunctions.net/getTickets').subscribe(data => {
      this.tickets = data;
      this.showSpinner = false;
    });
  }

  goToInvoice() {
    this.dialog.open(InvoiceComponent, {
          width: '400px'
      });
  }

}
