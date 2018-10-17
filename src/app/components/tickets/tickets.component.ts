import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {InvoiceComponent} from '../invoice/invoice.component';
import {Ticket} from '../../customObjects/ticket';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {

  tickets: Ticket[];
  showSpinner: Boolean;

    constructor(private http: HttpClient, private router: Router, public dialog: MatDialog) {
    this.showSpinner = true;
  }

  ngOnInit() {
    this.http.get<Ticket[]>('https://us-central1-devfest-2018-cz.cloudfunctions.net/getTickets').subscribe(data => {
      this.tickets = data;
      this.showSpinner = false;
    });
  }

  goToInvoice() {
      const dialogRef = this.dialog.open(InvoiceComponent, {
          width: '400px'
      });
  }

}
