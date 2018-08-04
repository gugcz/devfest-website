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
import {TeamComponent} from './pages/team/team.component';
import {MediaComponent} from './pages/media/media.component';
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
        TeamComponent,
        MediaComponent,
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
        MatProgressBarModule
        // TODO - konfigure service worker ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production})
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
