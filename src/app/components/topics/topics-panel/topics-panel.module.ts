import { NgModule } from '@angular/core';
import { TopicsPanelComponent } from './topics-panel.component';
import { TopicModule } from '../topic/topic.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonModule } from '@angular/common';
import { AngularFirestoreModule } from '@angular/fire/firestore';

@NgModule({
  declarations: [TopicsPanelComponent],
  exports: [TopicsPanelComponent],
  imports: [TopicModule, SharedModule, CommonModule, AngularFirestoreModule],
})
export class TopicsPanelModule {}
