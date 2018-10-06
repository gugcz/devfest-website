import {Component, OnInit} from '@angular/core';
import {TeamSectionComponent} from '../team/team-section.component';
import {MatDialogRef} from '@angular/material';
import {Talk, Speaker} from '../../../database/talk';
import {AngularFireStorage} from 'angularfire2/storage';
import {AngularFirestore} from 'angularfire2/firestore';
import {Organizer} from '../../../database/organizer';
import {TimeSlot, TimeSlotItem} from '../../../database/time-slot';
import {Time} from '@angular/common';

@Component({
  selector: 'app-schedule-section',
  templateUrl: './schedule-section.component.html',
  styleUrls: ['./schedule-section.component.scss']
})
export class ScheduleSectionComponent implements OnInit {

  timeSlots: TimeSlot[];
  selectedTimeSlotId: string;

  constructor(public dialogRef: MatDialogRef<ScheduleSectionComponent>, private firestore: AngularFirestore) {
  }

  ngOnInit() {
    this.processTimeSlots();
  }

  async processTimeSlots() {
    this.timeSlots = [];
    this.selectedTimeSlotId = '';

    const timeSlotsSnapshot = await this.firestore.collection('timeSlots').ref.get();
    timeSlotsSnapshot.docs.forEach(timeSlotSnap => {
      const data = timeSlotSnap.data();

      this.selectedTimeSlotId = data.primary ? data.id : this.selectedTimeSlotId;

      const timeSlotsItems: TimeSlotItem[] = data.sessions.map(timeSlotItem => ({
        session: timeSlotItem.session,
        track: timeSlotItem.track
      }));

      const timeSlot: TimeSlot = {
        id: data.id,
        text: data.text,
        endTime: data.endTime,
        startTime: data.startTime,
        sessions: timeSlotsItems,
      };

      this.timeSlots.push(timeSlot);
    });
  }

  changeSelectedTimeSlot(id: string) {
    this.selectedTimeSlotId = id;
  }

  close() {
    this.dialogRef.close();
  }

}
