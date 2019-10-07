import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatIconModule, MatButtonModule } from '@angular/material';
import { TagAvatarModule } from '../tag-avatar/tag-avatar.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TalkDetailComponent } from './talk-detail.component';

@NgModule({
  declarations: [TalkDetailComponent],
  exports: [TalkDetailComponent],
  imports: [CommonModule, MatDialogModule, MatIconModule, TagAvatarModule, SharedModule, MatButtonModule],
})
export class TalkDetailModule {}
