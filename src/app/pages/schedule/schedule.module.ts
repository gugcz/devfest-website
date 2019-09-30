import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleRoutingModule } from './schedule-routing.module';
import { SpeakersComponent } from './pages/speakers/speakers.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { TagAvatarComponent } from '../../components/tag-avatar/tag-avatar.component';
import { SpeakerCardComponent } from '../../components/speaker-card/speaker-card.component';
import {
  MatDialogModule,
  MatButtonModule,
  MatIconModule,
} from '@angular/material';
import { SpeakerDetailComponent } from '../../components/speaker-detail/speaker-detail.component';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { SocialIconsService } from '../../services/social-icons.service';
import { SharedModule } from '../../shared/shared.module';
import { SpeakerDetailModule } from 'src/app/components/speaker-detail/speaker-detail.module';
import { SpeakerCardModule } from 'src/app/components/speaker-card/speaker-card.module';

@NgModule({
  declarations: [SpeakersComponent, ScheduleComponent],
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    SpeakerDetailModule,
    SpeakerCardModule,
  ],
  entryComponents: [SpeakerDetailComponent],
})
export class ScheduleModule {}
