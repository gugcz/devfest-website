import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home.component';
import {TicketAdditionalInfoComponent} from './ticket-additional-info/ticket-additional-info.component';
import {TicketsComponent} from './tickets/tickets.component';
import {
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSnackBarModule
} from '@angular/material';
import {HomeRoutingModule} from './home-routing.module';
import {InvoiceFormComponent} from './invoice-form/invoice-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TopPartnerLogoComponent} from './top-partner-logo/top-partner-logo.component';
import {TopPartnerPanelComponent} from './top-partner-panel/top-partner-panel.component';
import {PhotoPanelComponent} from './photo-panel/photo-panel.component';
import { LazyDirective } from './lazy.directive';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  declarations: [
    HomeComponent,
    InvoiceFormComponent,
    TicketAdditionalInfoComponent,
    TicketsComponent,
    TopPartnerLogoComponent,
    TopPartnerPanelComponent,
    PhotoPanelComponent,
    LazyDirective
  ],
  entryComponents: [
    TicketAdditionalInfoComponent,
    InvoiceFormComponent
  ]
})
export class HomeModule {
}
