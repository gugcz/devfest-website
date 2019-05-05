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
import {MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatTabsModule, MatToolbarModule} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import {NeonLogoMinComponent} from './app/neon-logo-min/neon-logo-min.component';
import {NavigationComponent} from './app/navigation/navigation.component';
import {FooterComponent} from './app/footer/footer.component';
import {ContributePanelComponent} from './app/contribute-panel/contribute-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    NeonLogoMinComponent,
    NavigationComponent,
    FooterComponent,
    ContributePanelComponent
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
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
