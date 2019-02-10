import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { TicketGroup, Ticket } from 'src/app/dto/ticket-group';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

interface TicketView extends Ticket{
  title: string,
  price: number,
  eur_price: number,
  active: boolean,
  sold_out: boolean,
  start: string,
  end: string,
  description: string,
  url: string,
}

interface TicketGroupView extends TicketGroup{
  tickets: TicketView[];
}


@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({opacity: 0}),
        animate('500ms', style({opacity: 1}))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('500ms', style({opacity: 0}))
      ])
    ])
  ]
})
export class TicketsComponent implements OnInit {

  private partnerGroupCollection: AngularFirestoreCollection<TicketGroup>;
  ticketGroups: TicketGroupView[];

  constructor(private afFunctions: AngularFireFunctions, private afStore: AngularFirestore) {

  }

  ngOnInit() {
    this.prepareTickets();
  }

  async prepareTickets(){
    const callable = this.afFunctions.httpsCallable('getTickets');
    const titoData = await callable({}).toPromise();
    this.partnerGroupCollection = this.afStore.collection('ticketGroups', ref => ref.orderBy('order'));
    const groups = await this.partnerGroupCollection.get().toPromise();
    this.ticketGroups = groups.docs.map((doc) => {
      const group =  doc.data() as TicketGroupView;
      group.tickets = group.tickets.map((tic) => {
        const titoTic = titoData.filter(one => one.title === tic.titoName);
        return titoTic.length > 0 ? titoTic[0] : null;
      });
      return group
    });
    console.log(this.ticketGroups);
  }

}
