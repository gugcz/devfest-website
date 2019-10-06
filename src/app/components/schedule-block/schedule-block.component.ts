import { Component, Input, Output, EventEmitter } from '@angular/core';
import Speaker from 'src/app/data/speaker';
import { animFadeInOut } from 'src/app/animations';

@Component({
  selector: 'app-schedule-block',
  templateUrl: './schedule-block.component.html',
  styleUrls: ['./schedule-block.component.scss'],
  animations: [animFadeInOut],
})
export class ScheduleBlockComponent {
  @Input() title: string;
  @Input() level: string;
  @Input() language: 'EN' | 'CZ';
  @Input() duration: number;
  @Input() speaker1: Speaker;
  @Input() speaker2: Speaker;
  @Output() blockClicked = new EventEmitter<void>();

  constructor() {}

  wc_hex_is_light(color) {
    const hex = color.replace('#', '');
    const c_r = parseInt(hex.substr(0, 2), 16);
    const c_g = parseInt(hex.substr(2, 2), 16);
    const c_b = parseInt(hex.substr(4, 2), 16);
    const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
    return brightness > 155;
  }
}
