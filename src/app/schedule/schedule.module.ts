import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleRoutingModule } from './schedule-routing.module';
import { SpeakersComponent } from './pages/speakers/speakers.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { TagAvatarComponent } from './components/tag-avatar/tag-avatar.component';

@NgModule({
  declarations: [SpeakersComponent, ScheduleComponent, TagAvatarComponent],
  imports: [
    CommonModule,
    ScheduleRoutingModule
  ]
})
export class ScheduleModule { }
