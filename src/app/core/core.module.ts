import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireFunctionsModule } from '@angular/fire/functions';

@NgModule({
  imports: [
    CommonModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence({experimentalTabSynchronization: true}),
    AngularFireStorageModule,
    AngularFireFunctionsModule
  ],
  declarations: []
})
export class CoreModule { }
