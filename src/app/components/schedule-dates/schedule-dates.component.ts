import { Component, Input, Output, EventEmitter } from '@angular/core';
import { animFadeInOut } from 'src/app/animations';

@Component({
  selector: 'app-schedule-dates',
  templateUrl: './schedule-dates.component.html',
  styleUrls: ['./schedule-dates.component.scss'],
  animations: [animFadeInOut],
})
export class ScheduleDatesComponent {
  @Input() dates: Date[];
  @Output() datePicked = new EventEmitter<number>();

  constructor() {}
}
