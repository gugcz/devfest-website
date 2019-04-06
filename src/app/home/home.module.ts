import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceFormComponentModule } from '../components/invoice-form/invoice-form.module';
import { TicketAdditionalInfoComponentModule } from '../components/ticket-additional-info/tickets-additional-info.module';
import { NeonDateComponentModule } from '../components/neon-date/neon-date.module';
import { NeonLogoComponentModule } from '../components/neon-logo/neon-logo.module';
import { TicketsComponentModule } from '../components/tickets/tickets.module';
import { PartnerPanelComponentModule } from '../components/partner-panel/partner-panel.module';
import { PhotoSectionComponentModule } from '../components/photo-section/photo-section.module';
import { InvoiceFormComponent } from '../components/invoice-form/invoice-form.component';
import { TicketAdditionalInfoComponent } from '../components/ticket-additional-info/ticket-additional-info.component';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    InvoiceFormComponentModule,
    TicketAdditionalInfoComponentModule,
    NeonDateComponentModule,
    NeonLogoComponentModule,
    MatIconModule,
    TicketsComponentModule,
    PartnerPanelComponentModule,
    PhotoSectionComponentModule,
    InvoiceFormComponentModule,
    MatButtonModule
  ],
  declarations: [
    HomeComponent
  ],
  entryComponents: [
    InvoiceFormComponent,
    TicketAdditionalInfoComponent
  ]
})
export class HomeModule { }
