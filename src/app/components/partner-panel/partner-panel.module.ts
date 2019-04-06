import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerLogoComponentModule } from '../partner-logo/partner-logo.module';
import { PartnerPanelComponent } from './partner-panel.component';

@NgModule({
  imports: [
    CommonModule,
    PartnerLogoComponentModule
  ],
  declarations: [
    PartnerPanelComponent,
  ],
  exports: [
    PartnerPanelComponent
  ]
})
export class PartnerPanelComponentModule { }
