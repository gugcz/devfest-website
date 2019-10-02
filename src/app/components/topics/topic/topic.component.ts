import { Component, Input, OnInit } from '@angular/core';
import { animFadeInOut } from 'src/app/animations';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss'],
  animations: [animFadeInOut],
})
export class TopicComponent {
  @Input() name: string;
  @Input() color: string;
}
