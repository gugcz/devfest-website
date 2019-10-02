import { NgModule } from '@angular/core';
import { TopPartnerPanelComponent } from './top-partner-panel.component';
import { TopPartnerLogoModule } from '../top-partner-logo/top-partner-logo.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [TopPartnerPanelComponent],
  imports: [TopPartnerLogoModule, CommonModule],
  exports: [TopPartnerPanelComponent],
})
export class TopPartnerPanelModule {}
