import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Room from 'src/app/data/room';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  isMobile: boolean;
  dates: Date[];

  constructor(
    private deviceDetector: DeviceDetectorService,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.isMobile = this.deviceDetector.isMobile();
    this.firestore
      .collection<Room>('rooms')
      .valueChanges()
      .subscribe(a => {
        this.dates = a
          .map(one => one.date.toDate())
          .map(date => date.getTime())
          .filter((date, i, array) => array.indexOf(date) === i)
          .map(time => new Date(time));
      });
  }

  changeDate(i) {
    console.log(i);
  }
}
