import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PressComponent} from './press.component';
import {PressRoutingModule} from './press-routing.module';
import {MatButtonModule, MatIconModule} from '@angular/material';
import {PressLinkTableComponent} from './press-link-table/press-link-table.component';
import {MemberPanelComponent} from './member-panel/member-panel.component';
import {MemberPanelAvatarComponent} from './member-panel-avatar/member-panel-avatar.component';

@NgModule({
  declarations: [PressComponent, PressLinkTableComponent, MemberPanelComponent, MemberPanelAvatarComponent],
  imports: [
    CommonModule,
    PressRoutingModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class PressModule {
}
