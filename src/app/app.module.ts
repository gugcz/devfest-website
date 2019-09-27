import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { HttpClientModule } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { StoreModule } from '@ngrx/store';
import { ContributePanelModule } from './components/contribute-panel/contribute-panel.module';
import { FAQModule } from './components/faq/faq.module';
import { FooterModule } from './components/footer/footer.module';
import { NavigationModule } from './components/navigation/navigation.module';
import { MatSidenavModule, MatListModule } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    MatSidenavModule,
    MatListModule,
    NavigationModule,
    FooterModule,
    ContributePanelModule,
    FAQModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    DeviceDetectorModule.forRoot(),
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    HttpClientModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAyh_pL4QhU2XjcGI9QyRfPRI2ZqEEF0aA',
      language: 'en',
    }),
    StoreModule.forRoot({}),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
