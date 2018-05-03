import {Component, OnInit} from '@angular/core';
import {Ticket} from '../../database/ticket';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {

  tickets$: Observable<Ticket[]>;

  constructor(private fireStore: AngularFirestore) {
  }

  ngOnInit() {
    this.tickets$ = this.fireStore.collection<Ticket>('tickets', ref => ref.orderBy('order')).valueChanges();
    console.log(this.tickets$);
  }

}
