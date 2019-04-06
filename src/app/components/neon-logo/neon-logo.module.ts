import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeonLogoComponent } from './neon-logo.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    NeonLogoComponent,
  ],
  exports: [
    NeonLogoComponent
  ]
})
export class NeonLogoComponentModule { }
