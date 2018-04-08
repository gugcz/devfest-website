import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from './global/shared.module';
import {ComponentsModule} from './components/components.module';
import {AngularFireModule} from 'angularfire2';
import {environment} from '../environments/environment';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {AngularFireStorageModule} from 'angularfire2/storage';
import {PagesModule} from './pages/pages.module';
import {MetaChangerService} from './services/meta-changer.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // angular
    BrowserAnimationsModule,
    BrowserModule,

    NoopAnimationsModule,
    SharedModule,
    ComponentsModule,
    AppRoutingModule,
    PagesModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule
  ],
  providers: [MetaChangerService],
  bootstrap: [AppComponent]
})
export class AppModule {


}
