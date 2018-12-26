import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './team.component';
import { TeamRoutingModule } from './team-routing.module';
import { MemberCardComponent } from './member-card/member-card.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    TeamRoutingModule,
    SharedModule,
  ],
  declarations: [TeamComponent, MemberCardComponent]
})
export class TeamModule { }
