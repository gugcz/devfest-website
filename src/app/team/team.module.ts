import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './team.component';
import { TeamRoutingModule } from './team-routing.module';
import { MemberCardComponentModule } from '../components/member-card/member-card.module';

@NgModule({
  imports: [
    CommonModule,
    TeamRoutingModule,
    MemberCardComponentModule,
  ],
  declarations: [
    TeamComponent
  ]
})
export class TeamModule { }
