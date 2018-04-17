import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../global/shared.module';
import {CountdownComponent} from './countdown/countdown.component';
import {AppRoutingModule} from '../app-routing.module';
import {FooterComponent} from './footer/footer.component';
import {SocialNetworksComponent} from './social-networks/social-networks.component';
import {OrganizerCardComponent} from './organizer-card/organizer-card.component';
import {EmailNotifierComponent} from './email-notifier/email-notifier.component';
import {TicketsComponent} from "./tickets/tickets.component";
import {TicketComponent} from "./ticket/ticket.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule
  ],
  declarations: [
    CountdownComponent,
    FooterComponent,
    SocialNetworksComponent,
    OrganizerCardComponent,
    EmailNotifierComponent,
    TicketsComponent,
    TicketComponent
  ],
  exports: [
    CountdownComponent,
    FooterComponent,
    SocialNetworksComponent,
    OrganizerCardComponent,
    EmailNotifierComponent,
    TicketsComponent,
    TicketComponent
  ]
})
export class ComponentsModule {
}
