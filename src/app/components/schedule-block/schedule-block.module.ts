import { NgModule } from '@angular/core';
import { ScheduleBlockComponent } from './schedule-block.component';
import { TagAvatarModule } from '../tag-avatar/tag-avatar.module';
import { CommonModule } from '@angular/common';
import { DeviceDetectorService, DeviceDetectorModule } from 'ngx-device-detector';

@NgModule({
  declarations: [ScheduleBlockComponent],
  exports: [ScheduleBlockComponent],
  imports: [TagAvatarModule, CommonModule, DeviceDetectorModule]
})
export class ScheduleBlockModule {}
