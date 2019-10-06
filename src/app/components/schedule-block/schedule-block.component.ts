import { Component, Input, Output, EventEmitter } from '@angular/core';
import Speaker from 'src/app/data/speaker';
import { animFadeInOut } from 'src/app/animations';

@Component({
  selector: 'app-schedule-block',
  templateUrl: './schedule-block.component.html',
  styleUrls: ['./schedule-block.component.scss'],
  animations: [
    animFadeInOut
  ]
})
export class ScheduleBlockComponent {

  @Input() title: string;
  @Input() level: string;
  @Input() language: 'EN'|'CZ';
  @Input() duration: number;
  @Input() speaker1: Speaker;
  @Input() speaker2: Speaker;
  @Output() blockClicked = new EventEmitter<void>();

  constructor() {}
}
