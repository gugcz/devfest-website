import { NgModule } from '@angular/core';
import { PartnerLogoComponent } from './partner-logo.component';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [PartnerLogoComponent],
  exports: [PartnerLogoComponent],
  imports: [CommonModule, AngularFirestoreModule],
})
export class PartnerLogoModule {}
