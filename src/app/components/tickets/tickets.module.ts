import { NgModule } from '@angular/core';
import { TicketsComponent } from './tickets.component';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';
import { TicketAdditionalInfoComponent } from '../ticket-additional-info/ticket-additional-info.component';
import { InvoiceFormModule } from '../invoice-form/invoice-form-module';
import { TicketAdditionalInfoModule } from '../ticket-additional-info/ticket-additional-info.module';
import { MatDialogModule, MatProgressSpinnerModule } from '@angular/material';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    TicketsComponent,
  ],
  entryComponents: [InvoiceFormComponent, TicketAdditionalInfoComponent],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    InvoiceFormModule,
    TicketAdditionalInfoModule,
  ],
  exports: [TicketsComponent],
})
export class TicketsModule {}
