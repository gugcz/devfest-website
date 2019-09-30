import { NgModule } from '@angular/core';
import { SpeakerCardComponent } from './speaker-card.component';
import { MatDialogModule } from '@angular/material';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { TagAvatarModule } from '../tag-avatar/tag-avatar.module';

@NgModule({
  declarations: [SpeakerCardComponent],
  imports: [MatDialogModule, DeviceDetectorModule, TagAvatarModule],
  exports: [SpeakerCardComponent],
})
export class SpeakerCardModule {}
