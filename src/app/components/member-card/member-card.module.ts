import { NgModule } from '@angular/core';
import { MemberCardComponent } from './member-card.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatButtonModule } from '@angular/material';
import { SocialIconsService } from 'src/app/services/social-icons.service';

@NgModule({
  declarations: [MemberCardComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
  ],
  exports: [MemberCardComponent],
  providers: [SocialIconsService],
})
export class MemberCardModule {}
