import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { TicketAdditionalInfoComponent } from '../../components/ticket-additional-info/ticket-additional-info.component';
import { TicketsComponent } from '../../components/tickets/tickets.component';
import {
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSnackBarModule,
} from '@angular/material';
import { HomeRoutingModule } from './home-routing.module';
import { InvoiceFormComponent } from '../../components/invoice-form/invoice-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TopPartnerLogoComponent } from './top-partner-logo/top-partner-logo.component';
import { TopPartnerPanelComponent } from './top-partner-panel/top-partner-panel.component';
import { SharedModule } from '../../shared/shared.module';
import { InvoiceFormModule } from 'src/app/components/invoice-form/invoice-form-module';
import { PhotoPanelModule } from 'src/app/components/photo-panel/photo-panel.module';
import { TicketAdditionalInfoModule } from 'src/app/components/ticket-additional-info/ticket-additional-info.module';
import { TicketsModule } from 'src/app/components/tickets/tickets.module';

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
    SharedModule,
    PhotoPanelModule,
    TicketsModule
  ],
  declarations: [
    HomeComponent,
    TopPartnerLogoComponent,
    TopPartnerPanelComponent,
  ],
})
export class HomeModule {}
