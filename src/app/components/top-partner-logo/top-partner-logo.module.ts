import { NgModule } from '@angular/core';
import { TopPartnerLogoComponent } from './top-partner-logo.component';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [TopPartnerLogoComponent],
  imports: [AngularFireStorageModule, AngularFirestoreModule, CommonModule],
  exports: [TopPartnerLogoComponent],
})
export class TopPartnerLogoModule {}
