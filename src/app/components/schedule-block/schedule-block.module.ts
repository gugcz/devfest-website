import { NgModule } from '@angular/core';
import { ScheduleBlockComponent } from './schedule-block.component';
import { TagAvatarModule } from '../tag-avatar/tag-avatar.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [ScheduleBlockComponent],
  exports: [ScheduleBlockComponent],
  imports: [TagAvatarModule, CommonModule],
})
export class ScheduleBlockModule {}
