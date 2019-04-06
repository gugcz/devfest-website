import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerLogoComponent } from './partner-logo.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PartnerLogoComponent,
  ],
  exports: [
    PartnerLogoComponent
  ]
})
export class PartnerLogoComponentModule { }
