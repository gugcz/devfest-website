import {Component, Input, OnInit} from '@angular/core';
import {Ticket} from '../../database/ticket';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {

  @Input() ticket: Ticket;

  constructor() {
  }

  ngOnInit() {
    this.ticket.price = this.ticket.price.map(it => {
      return {
        title: it.title,
        price: Math.round(it.price)
      };
    });
  }

  buy() {
  }

}
