import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TeamComponent} from './team.component';
import {TeamRoutingModule} from './team-routing.module';
import {SocialIconsService} from '../../services/social-icons.service';
import { SharedModule } from '../../shared/shared.module';
import { MemberCardModule } from 'src/app/components/member-card/member-card.module';

@NgModule({
  imports: [
    CommonModule,
    TeamRoutingModule,
    MemberCardModule,
    SharedModule,
  ],
  declarations: [
    TeamComponent,
  ],
  providers: [
    SocialIconsService
  ]
})
export class TeamModule {
}
