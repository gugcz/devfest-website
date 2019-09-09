import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TeamComponent} from './team.component';
import {TeamRoutingModule} from './team-routing.module';
import {MemberCardComponent} from './member-card/member-card.component';
import {MatButtonModule, MatIconModule} from '@angular/material';
import {SocialIconsService} from '../services/social-icons.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    TeamRoutingModule,
    MatIconModule,
    MatButtonModule,
    SharedModule
  ],
  declarations: [
    TeamComponent,
    MemberCardComponent
  ],
  providers: [
    SocialIconsService
  ]
})
export class TeamModule {
}
