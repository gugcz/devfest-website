import { NgModule } from '@angular/core';
import { TopicComponent } from './topic.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [TopicComponent],
  exports: [TopicComponent],
})
export class TopicModule {}
