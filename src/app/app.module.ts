import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {environment} from '../environments/environment';
import {AngularFireFunctionsModule} from '@angular/fire/functions';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {DeviceDetectorModule} from 'ngx-device-detector';
import {
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatTabsModule,
  MatToolbarModule
} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import {NavigationComponent} from './core/navigation/navigation.component';
import {FooterComponent} from './core/footer/footer.component';
import {ContributePanelComponent} from './core/contribute-panel/contribute-panel.component';
import {FaqComponent} from './core/faq/faq.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    FooterComponent,
    ContributePanelComponent,
    FaqComponent
  ],
  imports: [
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    DeviceDetectorModule.forRoot(),
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    MatTabsModule,
    HttpClientModule,
    MatIconModule,
    MatToolbarModule,
    AppRoutingModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule
  ],
  providers: [],
  entryComponents: [FaqComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
