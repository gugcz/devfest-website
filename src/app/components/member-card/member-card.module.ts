import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { MemberCardComponent } from './member-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SocialIconsService } from '../../services/social-icons.service';
import { SocialsPipe } from './socials.pipe';

@NgModule({
  imports: [
    CommonModule,
    AngularFirestoreModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [
    MemberCardComponent,
    SocialsPipe
  ],
  exports: [
    MemberCardComponent
  ],
  providers: [
    SocialIconsService
  ]
})
export class MemberCardComponentModule { }
