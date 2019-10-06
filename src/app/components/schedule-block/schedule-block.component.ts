import { Component, Input } from '@angular/core';
import Speaker from 'src/app/data/speaker';

@Component({
  selector: 'app-schedule-block',
  templateUrl: './schedule-block.component.html',
  styleUrls: ['./schedule-block.component.scss'],
})
export class ScheduleBlockComponent {

  @Input() title: string;
  @Input() level: string;
  @Input() language: 'EN'|'CZ';
  @Input() duration: number;
  @Input() speaker1: Speaker;
  @Input() speaker2: Speaker;

  constructor() {}
}
