import { NgModule } from '@angular/core';
import { MemberPanelAvatarComponent } from './member-panel-avatar.component';
import { SocialIconsService } from 'src/app/services/social-icons.service';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [MemberPanelAvatarComponent],
  exports: [MemberPanelAvatarComponent],
  providers: [SocialIconsService],
  imports: [AngularFireStorageModule, CommonModule],
})
export class MemberPanelAvatarModule {}
