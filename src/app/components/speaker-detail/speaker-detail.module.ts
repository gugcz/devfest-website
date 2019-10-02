import { NgModule } from '@angular/core';
import { SpeakerDetailComponent } from './speaker-detail.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatIconModule, MatButtonModule } from '@angular/material';
import { TagAvatarModule } from '../tag-avatar/tag-avatar.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [SpeakerDetailComponent],
  exports: [SpeakerDetailComponent],
  imports: [CommonModule, MatDialogModule, MatIconModule, TagAvatarModule, SharedModule, MatButtonModule],
})
export class SpeakerDetailModule {}
