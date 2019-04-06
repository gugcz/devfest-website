import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnersRoutingModule } from './partners-routing.module';
import { PartnersComponent } from './partners.component';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { PartnerPanelComponentModule } from '../components/partner-panel/partner-panel.module';

@NgModule({
  declarations: [
    PartnersComponent
  ],
  imports: [
    PartnersRoutingModule,
    CommonModule,
    AngularFirestoreModule,
    PartnerPanelComponentModule
  ]
})
export class PartnersModule { }
