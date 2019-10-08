import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Room from 'src/app/data/room';
import Schedule from 'src/app/data/schedule';
import { MatDialog } from '@angular/material';
import { TalkDetailComponent } from 'src/app/components/talk-detail/talk-detail.component';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  isMobile: boolean;
  dates: Date[];
  schedules: Schedule[][];
  rooms: string[];

  constructor(
    private deviceDetector: DeviceDetectorService,
    private firestore: AngularFirestore,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.isMobile = this.deviceDetector.isMobile();
    this.firestore
      .collection<Room>('rooms', ref=> ref.orderBy('order'))
      .valueChanges()
      .subscribe(a => {
        this.dates = a
          .map(one => one.date.toDate())
          .map(date => date.getTime())
          .filter((date, i, array) => array.indexOf(date) === i)
          .map(time => new Date(time));

        this.schedules = a.map(one =>
          one.schedule.sort((je, dv) => {
            const date1 = je.startTime;
            const date2 = dv.startTime;
            if (date1 > date2) {
              return 1;
            }
            if (date1 < date2) {
              return -1;
            }
            return 0;
          })
        );
        this.rooms = a.map(a => a.name);
      });
  }

  changeDate(i) {
    console.log(i);
  }

  clickedBlock(i) {
    const desktopConfig = {
      width: '800px',
      data: {
        ref: i
      },
      autoFocus: false,
    };
    const mobileConfig = {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      data: {
        ref: i
      },
      autoFocus: false,
    };
    this.dialog.open(TalkDetailComponent, this.isMobile ? mobileConfig : desktopConfig);
  }
}
