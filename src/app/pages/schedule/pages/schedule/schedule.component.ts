import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

  isMobile: boolean;

  constructor(private deviceDetector: DeviceDetectorService) { }

  ngOnInit() {
    this.isMobile = this.deviceDetector.isMobile();
  }

}
