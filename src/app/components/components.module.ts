import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../global/shared.module';
import {CountdownComponent} from './countdown/countdown.component';
import {AppRoutingModule} from '../app-routing.module';
import {FooterComponent} from './footer/footer.component';
import {SocialNetworksComponent} from './social-networks/social-networks.component';
import {OrganizerCardComponent} from './organizer-card/organizer-card.component';
import {TicketsComponent} from './tickets/tickets.component';
import {TicketComponent} from './ticket/ticket.component';
import {RegisterNowButtonComponent} from './register-now-button/register-now-button.component';
import {PartnersComponent} from './partners/partners.component';
import {EmailNotifierComponent} from './email-notifier/email-notifier.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        AppRoutingModule
    ],
    declarations: [
        CountdownComponent,
        FooterComponent,
        EmailNotifierComponent,
        SocialNetworksComponent,
        OrganizerCardComponent,
        TicketsComponent,
        TicketComponent,
        RegisterNowButtonComponent,
        PartnersComponent
    ],
    exports: [
        CountdownComponent,
        FooterComponent,
        SocialNetworksComponent,
        OrganizerCardComponent,
        TicketsComponent,
        TicketComponent,
        RegisterNowButtonComponent,
        PartnersComponent
    ]
})
export class ComponentsModule {
}
