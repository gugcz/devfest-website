import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { TicketGroup } from '../../data/ticket-group';
import { animate, style, transition, trigger } from '@angular/animations';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';
import { MatDialog } from '@angular/material/dialog';
import { TicketGroupView } from './ticket-group-view';
import { TicketAdditionalInfoComponent } from '../ticket-additional-info/ticket-additional-info.component';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate('600ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TicketsComponent implements OnInit {

  ticketGroups: TicketGroupView[];
  private partnerGroupCollection: AngularFirestoreCollection<TicketGroup>;
  isMobile: boolean;

  constructor(
    private afFunctions: AngularFireFunctions,
    private afStore: AngularFirestore,
    private dialog: MatDialog,
    private device: DeviceDetectorService) {
  }

  ngOnInit() {
    this.prepareTickets();
    this.isMobile = this.device.isMobile();
  }

  async prepareTickets() {
    const callable = this.afFunctions.httpsCallable('getTickets');
    const titoData = await callable({}).toPromise();
    this.partnerGroupCollection = this.afStore.collection('ticketGroups',
      ref => ref.orderBy('order'));
    const groups = await this.partnerGroupCollection.get().toPromise();
    this.ticketGroups = groups.docs.map((doc) => {
      const group = { ...doc.data() } as TicketGroupView;
      let url = '';
      group.tickets = group.tickets.map((tic, index) => {
        const titoTic = titoData.filter(one => one.title === tic.titoName && one.sold_out === false);
        if (titoTic.length > 0) {
          if (index === 0) {
            url += titoTic[0].url;
          } else {
            const parts = titoTic[0].url.split('/');
            url += (',' + parts[parts.length - 1]);
          }
        }
        return titoTic.length > 0 ? { publicName: tic.publicName, ...titoTic[0] } : null;
      });
      group.url = url;
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
          name,
          text,
        }
      });
    }
  }

}
