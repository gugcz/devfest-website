import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { NavigationComponentModule } from './components/navigation/navigation.module';
import { ContributePanelComponentModule } from './components/contribute-panel/contribue-panel.module';
import { FooterComponentModule } from './components/footer/footer.module';
import { NeonLogoComponentModule } from './components/neon-logo/neon-logo.module';
import { NeonDateComponentModule } from './components/neon-date/neon-date.module';
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence({experimentalTabSynchronization: true}),
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,

    NavigationComponentModule,
    ContributePanelComponentModule,
    FooterComponentModule,
    NeonLogoComponentModule,
    NeonDateComponentModule,
    MatSidenavModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
