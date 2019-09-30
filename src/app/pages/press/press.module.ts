import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PressComponent } from './press.component';
import { PressRoutingModule } from './press-routing.module';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { PressLinkTableModule } from 'src/app/components/press-link-table/press-link-table.module';
import { MemberPanelModule } from 'src/app/components/member-panel/member-panel.module';

@NgModule({
  declarations: [PressComponent],
  imports: [
    CommonModule,
    PressRoutingModule,
    MatButtonModule,
    MatIconModule,
    PressLinkTableModule,
    MemberPanelModule,
  ],
})
export class PressModule {}
