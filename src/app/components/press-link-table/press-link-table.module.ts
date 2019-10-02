import { NgModule } from '@angular/core';
import { PressLinkTableComponent } from './press-link-table.component';
import { CommonModule } from '@angular/common';
import { DeviceDetectorModule } from 'ngx-device-detector';

@NgModule({
  declarations: [PressLinkTableComponent],
  exports: [PressLinkTableComponent],
  imports: [
      CommonModule,
      DeviceDetectorModule
  ]
})
export class PressLinkTableModule {}
