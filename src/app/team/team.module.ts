import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './team.component';
import { TeamRoutingModule } from './team-routing.module';
import { MemberCardComponent } from './member-card/member-card.component';
import { SharedModule } from '../shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    TeamRoutingModule,
    SharedModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [TeamComponent, MemberCardComponent]
})
export class TeamModule { }
