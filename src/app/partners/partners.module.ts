import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnersRoutingModule } from './partners-routing.module';
import { SharedModule } from '../shared/shared.module';
import { PartnersComponent } from './partners.component';
import { AngularFirestoreModule } from '@angular/fire/firestore';

@NgModule({
  declarations: [
    PartnersComponent
  ],
  imports: [
    PartnersRoutingModule,
    CommonModule,
    SharedModule,
    AngularFirestoreModule
  ]
})
export class PartnersModule { }
