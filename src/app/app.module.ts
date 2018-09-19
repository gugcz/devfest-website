import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {AngularFireStorageModule} from 'angularfire2/storage';
import {AngularFireModule} from 'angularfire2';
import {RegisterNowButtonComponent} from './components/register-now-button/register-now-button.component';
import {EmailNotifierComponent} from './components/email-notifier/email-notifier.component';
import {TicketComponent} from './components/ticket/ticket.component';
import {CallForProposalsComponent} from './components/call-for-proposals/call-for-proposals.component';
import {OrganizerCardComponent} from './components/organizer-card/organizer-card.component';
import {PartnersComponent} from './components/partners/partners.component';
import {InvoiceComponent} from './components/invoice/invoice.component';
import {CountdownComponent} from './components/countdown/countdown.component';
import {FooterComponent} from './components/footer/footer.component';
import {SocialNetworksComponent} from './components/social-networks/social-networks.component';
import {TicketsComponent} from './components/tickets/tickets.component';
import {HomeComponent} from './pages/home/home.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {MediaGraphicsComponent} from './components/media-graphics/media-graphics.component';
import {MediaPressComponent} from './components/media-press/media-press.component';
import {MediaContactComponent} from './components/media-contact/media-contact.component';
import {MediaOthersComponent} from './components/media-others/media-others.component';
import { SectionsComponent } from './pages/sections/sections.component';
import { TeamSectionComponent } from './pages/sections/team/team-section.component';
import { MenuComponent } from './components/menu/menu.component';
import { MediaSectionComponent } from './pages/sections/media/media-section.component';
import { TicketsSectionComponent } from './pages/sections/tickets/tickets-section.component';
import { VenueSectionComponent } from './pages/sections/venue/venue-section.component';
import { VenuePositionMapComponent } from './components/venue-position-map/venue-position-map.component';
import { AgmCoreModule } from '@agm/core';
import { SpeakersSectionComponent } from './pages/sections/speakers/speakers-section.component';
import { SpeakerDetailSectionComponent } from './pages/sections/speaker-detail/speaker-detail.component';
import { ScheduleSectionComponent } from './pages/sections/schedule/schedule-section.component';
@NgModule({
    declarations: [
        AppComponent,
        CountdownComponent,
        FooterComponent,
        EmailNotifierComponent,
        SocialNetworksComponent,
        OrganizerCardComponent,
        TicketsComponent,
        TicketComponent,
        RegisterNowButtonComponent,
        PartnersComponent,
        InvoiceComponent,
        CallForProposalsComponent,
        HomeComponent,
        MediaGraphicsComponent,
        MediaPressComponent,
        MediaContactComponent,
        MediaOthersComponent,
        SectionsComponent,
        TeamSectionComponent,
        MenuComponent,
        MediaSectionComponent,
        TicketsSectionComponent,
        VenueSectionComponent,
        VenuePositionMapComponent,
        SpeakersSectionComponent,
        SpeakerDetailSectionComponent
        TicketsSectionComponent,
        ScheduleSectionComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AngularFireStorageModule,
        CommonModule,
        RouterModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatToolbarModule,
        MatSelectModule,
        MatTabsModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatCardModule,
        MatSidenavModule,
        MatCheckboxModule,
        MatListModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        MatDialogModule,
        MatGridListModule,
        MatSnackBarModule,
        MatTableModule,
        MatPaginatorModule,
        MatProgressBarModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAyh_pL4QhU2XjcGI9QyRfPRI2ZqEEF0aA'
        })
    ],
    providers: [],
    entryComponents: [
        InvoiceComponent,
        TeamSectionComponent,
        MediaSectionComponent,
        TicketsSectionComponent,
        VenueSectionComponent,
        SpeakersSectionComponent,
        SpeakerDetailSectionComponent
        TicketsSectionComponent,
        ScheduleSectionComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
