import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleRoutingModule } from './schedule-routing.module';
import { SpeakersComponent } from './pages/speakers/speakers.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { TagAvatarComponent } from './components/tag-avatar/tag-avatar.component';
import { SpeakerCardComponent } from './components/speaker-card/speaker-card.component';
import { LazyDirective } from './lazy.directive';

@NgModule({
  declarations: [
    SpeakersComponent,
    ScheduleComponent,
    TagAvatarComponent,
    SpeakerCardComponent,
    LazyDirective
  ],
  imports: [
    CommonModule,
    ScheduleRoutingModule
  ]
})
export class ScheduleModule { }
