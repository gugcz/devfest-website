import { NgModule } from '@angular/core';
import { TicketsComponent } from './tickets.component';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';
import { TicketAdditionalInfoComponent } from '../ticket-additional-info/ticket-additional-info.component';
import { InvoiceFormModule } from '../invoice-form/invoice-form-module';
import { TicketAdditionalInfoModule } from '../ticket-additional-info/ticket-additional-info.module';
import { MatDialogModule, MatProgressSpinnerModule, MatButtonModule } from '@angular/material';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { CommonModule } from '@angular/common';
import { DeviceDetectorModule } from 'ngx-device-detector';

@NgModule({
  declarations: [
    TicketsComponent,
  ],
  entryComponents: [InvoiceFormComponent, TicketAdditionalInfoComponent],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    InvoiceFormModule,
    TicketAdditionalInfoModule,
    DeviceDetectorModule
  ],
  exports: [TicketsComponent],
})
export class TicketsModule {}
