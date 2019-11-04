import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { animFadeInOut } from 'src/app/animations';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-schedule-dates',
  templateUrl: './schedule-dates.component.html',
  styleUrls: ['./schedule-dates.component.scss'],
  animations: [animFadeInOut],
})
export class ScheduleDatesComponent implements OnInit {
  @Input() dates: Date[];
  @Output() datePicked = new EventEmitter<number>();
  @Input() currentPicked: number;

  isMobile: boolean;

  constructor(private device: DeviceDetectorService) {}

  ngOnInit() {
    this.isMobile = this.device.isMobile();
  }
}
