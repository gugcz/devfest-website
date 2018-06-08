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

  tickets: Ticket[];
  showSpinner: Boolean;

  constructor(private http: HttpClient) {
    this.showSpinner = true;
  }

  ngOnInit() {
    this.http.get<Ticket[]>('https://us-central1-devfest-2018-cz.cloudfunctions.net/getTickets').subscribe(data => {
      this.tickets = data;
      this.showSpinner = false;
    });
  }

}
