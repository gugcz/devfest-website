import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TeamComponent} from './team.component';
import {TeamRoutingModule} from './team-routing.module';
import {MemberCardComponent} from './member-card/member-card.component';
import {SocialsPipe} from './member-card/socials.pipe';
import {MatButtonModule, MatIconModule} from '@angular/material';
import {SocialIconsService} from '../services/social-icons.service';

@NgModule({
  imports: [
    CommonModule,
    TeamRoutingModule,
    MatIconModule,
    MatButtonModule,
  ],
  declarations: [
    TeamComponent,
    MemberCardComponent,
    SocialsPipe
  ],
  providers: [
    SocialIconsService
  ]
})
export class TeamModule {
}
