import { NgModule } from '@angular/core';
import { SpeakerCardComponent } from './speaker-card.component';
import { MatDialogModule } from '@angular/material';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { TagAvatarModule } from '../tag-avatar/tag-avatar.module';
import { SpeakerDetailComponent } from '../speaker-detail/speaker-detail.component';
import { SpeakerDetailModule } from '../speaker-detail/speaker-detail.module';

@NgModule({
  declarations: [SpeakerCardComponent],
  imports: [MatDialogModule, DeviceDetectorModule, TagAvatarModule, SpeakerDetailModule],
  exports: [SpeakerCardComponent],
  entryComponents: [SpeakerDetailComponent]
})
export class SpeakerCardModule {}
