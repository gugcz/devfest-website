import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeonDateComponent } from './neon-date.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    NeonDateComponent,
  ],
  exports: [
    NeonDateComponent
  ]
})
export class NeonDateComponentModule { }
