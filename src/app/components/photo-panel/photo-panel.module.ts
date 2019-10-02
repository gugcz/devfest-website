import { NgModule } from '@angular/core';
import { PhotoPanelComponent } from './photo-panel.component';
import { CommonModule } from '@angular/common';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [PhotoPanelComponent],
  imports: [
    CommonModule,
    SharedModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
  ],
  exports: [PhotoPanelComponent],
})
export class PhotoPanelModule {}
