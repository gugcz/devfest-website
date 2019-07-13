import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeakersComponent } from './speakers.component';
import { SpeakersRoutingModule } from './speakers-routing.module';

@NgModule({
  declarations: [SpeakersComponent],
  imports: [
    CommonModule,
    SpeakersRoutingModule
  ]
})
export class SpeakersModule { }
