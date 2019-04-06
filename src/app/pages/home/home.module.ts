import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { InvoiceFormComponentModule } from 'src/app/components/invoice-form/invoice-form.module';
import { TicketAdditionalInfoComponentModule } from 'src/app/components/ticket-additional-info/tickets-additional-info.module';
import { InvoiceFormComponent } from 'src/app/components/invoice-form/invoice-form.component';
import { TicketAdditionalInfoComponent } from 'src/app/components/ticket-additional-info/ticket-additional-info.component';
import { HomeComponent } from './home.component';
import { NeonDateComponentModule } from 'src/app/components/neon-date/neon-date.module';
import { NeonLogoComponentModule } from 'src/app/components/neon-logo/neon-logo.module';
import { MatIconModule } from '@angular/material/icon';
import { TicketsComponentModule } from 'src/app/components/tickets/tickets.module';
import { PartnerPanelComponentModule } from 'src/app/components/partner-panel/partner-panel.module';
import { PhotoSectionComponentModule } from 'src/app/components/photo-section/photo-section.module';
import { MatButtonModule } from '@angular/material/button';

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
