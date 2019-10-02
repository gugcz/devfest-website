import { NgModule } from '@angular/core';
import { MemberPanelComponent } from './member-panel.component';
import { MemberPanelAvatarModule } from '../member-panel-avatar/member-panel-avatar.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [MemberPanelComponent],
  exports: [MemberPanelComponent],
  imports: [MemberPanelAvatarModule, CommonModule],
})
export class MemberPanelModule {}
