import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { TicketGroup } from '../../data/ticket-group';
import { trigger, transition, style, animate } from '@angular/animations';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';
import { MatDialog } from '@angular/material/dialog';
import { TicketGroupView } from '../iticket/ticket-group-view';
import { TicketAdditionalInfoComponent } from '../ticket-additional-info/ticket-additional-info.component';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('500ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TicketsComponent implements OnInit {

  private partnerGroupCollection: AngularFirestoreCollection<TicketGroup>;
  ticketGroups: TicketGroupView[];

  constructor(private afFunctions: AngularFireFunctions, private afStore: AngularFirestore, private dialog: MatDialog) {

  }

  ngOnInit() {
    this.prepareTickets();
  }

  async prepareTickets() {
    const callable = this.afFunctions.httpsCallable('getTickets');
    const titoData = await callable({}).toPromise();
    this.partnerGroupCollection = this.afStore.collection('ticketGroups', ref => ref.orderBy('order'));
    const groups = await this.partnerGroupCollection.get().toPromise();
    this.ticketGroups = groups.docs.map((doc) => {
      const group = doc.data() as TicketGroupView;
      group.tickets = group.tickets.map((tic) => {
        const titoTic = titoData.filter(one => one.title === tic.titoName);
        return titoTic.length > 0 ? { tic, ...titoTic[0] } : null;
      });
      return group;
    });
  }

  openInvoiceModal() {
    this.dialog.open(InvoiceFormComponent);
  }

  showAdditionalInfo(text, name) {
    if (text != null) {
      this.dialog.open(TicketAdditionalInfoComponent, {
        data: {
          name: name,
          text: text,
        }
      });
    }
  }

}
