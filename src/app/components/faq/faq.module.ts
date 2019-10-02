import { NgModule } from '@angular/core';
import { FAQComponent } from './faq.component';
import { MatDialogModule, MatButtonModule } from '@angular/material';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [FAQComponent],
  imports: [MatDialogModule, MatButtonModule, AngularFirestoreModule, CommonModule],
  exports: [FAQComponent],
})
export class FAQModule {}
