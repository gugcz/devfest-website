import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PartnersRoutingModule} from './partners-routing.module';
import {PartnersComponent} from './partners.component';
import { PartnerPanelModule } from 'src/app/components/partner-panel/partner-panel.module';

@NgModule({
  declarations: [
    PartnersComponent,
  ],
  imports: [
    CommonModule,
    PartnersRoutingModule,
    PartnerPanelModule
  ]
})
export class PartnersModule {
}
