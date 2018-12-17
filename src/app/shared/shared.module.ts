import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeonLogoComponent } from './neon-logo/neon-logo.component';
import { NeonDateComponent } from './neon-date/neon-date.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    NeonLogoComponent,
    NeonDateComponent,
  ],
  exports: [
    NeonLogoComponent,
    NeonDateComponent
  ]
})
export class SharedModule { }
