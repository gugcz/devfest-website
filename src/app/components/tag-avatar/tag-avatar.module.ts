import { NgModule } from '@angular/core';
import { TagAvatarComponent } from './tag-avatar.component';
import { CommonModule } from '@angular/common';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [TagAvatarComponent],
  exports: [TagAvatarComponent],
  imports: [CommonModule, AngularFireStorageModule, SharedModule],
})
export class TagAvatarModule {}
