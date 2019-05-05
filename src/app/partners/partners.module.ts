import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PartnersRoutingModule} from './partners-routing.module';
import {PartnersComponent} from './partners.component';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {PartnerLogoComponent} from './partner-logo/partner-logo.component';
import {PartnerPanelComponent} from './partner-panel/partner-panel.component';
import {MatCardModule} from '@angular/material';

@NgModule({
  declarations: [
    PartnersComponent,
    PartnerLogoComponent,
    PartnerPanelComponent
  ],
  imports: [
    CommonModule,
    PartnersRoutingModule,
    CommonModule,
    MatCardModule,
    AngularFirestoreModule,
  ]
})
export class PartnersModule {
}
