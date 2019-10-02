import { NgModule } from '@angular/core';
import { PartnerPanelComponent } from './partner-panel.component';
import { PartnerLogoModule } from '../partner-logo/partner-logo.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [PartnerPanelComponent],
  exports: [PartnerPanelComponent],
  imports: [PartnerLogoModule, CommonModule],
})
export class PartnerPanelModule {}
