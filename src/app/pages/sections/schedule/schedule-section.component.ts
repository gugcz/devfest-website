import {Component, OnInit} from '@angular/core';
import {TeamSectionComponent} from '../team/team-section.component';
import {MatDialogRef} from '@angular/material';
import {Talk, Speaker} from '../../../database/talk';
import {AngularFireStorage} from 'angularfire2/storage';
import {AngularFirestore} from 'angularfire2/firestore';
import {Organizer} from '../../../database/organizer';
import {TimeSlot, TimeSlotItem} from '../../../database/time-slot';
import {Time} from '@angular/common';
import {startTimeRange} from '@angular/core/src/profile/wtf_impl';
import {Session} from 'selenium-webdriver';

@Component({
  selector: 'app-schedule-section',
  templateUrl: './schedule-section.component.html',
  styleUrls: ['./schedule-section.component.scss']
})
export class ScheduleSectionComponent implements OnInit {

  timeSlots: TimeSlot[];
  selectedTimeSlotId: string;
  timeSlotTracksRefs: {};
  timeSlotTracks: {};
  timeSlotSessions: {};
  times: number[];
  showTracks: boolean;

  constructor(public dialogRef: MatDialogRef<ScheduleSectionComponent>, private firestore: AngularFirestore) {
  }

  ngOnInit() {
    this.timeSlots = [];
    this.selectedTimeSlotId = '';
    this.timeSlotTracksRefs = {};
    this.timeSlotTracks = {};
    this.timeSlotSessions = {};
    this.showTracks = false;

    this.processTimeSlots()
      .then(this.processTracks.bind(this))
      .then(this.processSessions.bind(this));
  }

  async processTimeSlots() {
    const timeSlotsSnapshot = await this.firestore.collection('timeSlots').ref.get();
    timeSlotsSnapshot.docs.forEach(timeSlotSnap => {
      const data = timeSlotSnap.data();
      this.timeSlotTracksRefs[data.id] = [];

      this.selectedTimeSlotId = data.primary ? data.id : this.selectedTimeSlotId;

      const timeSlotsItems: TimeSlotItem[] = data.sessions.map(timeSlotItem => {
        if (this.timeSlotTracksRefs[data.id].indexOf(timeSlotItem.track.id) === -1) {
          this.timeSlotTracksRefs[data.id].push(timeSlotItem.track.id);
          const startDate = data.startTime.toDate();
          const endDate = data.endTime.toDate();
          this.createTimesArray(
            startDate.getHours(),
            endDate.getMinutes() === 0 ? endDate.getHours() : endDate.getHours() + 1
          );
        }

        return {
          session: timeSlotItem.session,
          track: timeSlotItem.track
        };
      });

      const timeSlot: TimeSlot = {
        id: data.id,
        text: data.text,
        endTime: data.endTime.toDate(),
        startTime: data.startTime.toDate(),
        sessions: timeSlotsItems,
        rowsCount: this.countRows(data.startTime.toDate(), data.endTime.toDate())
      };

      this.timeSlotSessions[data.id] = [];

      this.timeSlots.push(timeSlot);
    });
  }

  async processTracks() {
    const tracksSnapshot = await this.firestore.collection('tracks').ref.get();

    tracksSnapshot.docs.forEach(trackSnapshot => {
      Object.keys(this.timeSlotTracksRefs).forEach(timeSlotRef => {
        if (this.timeSlotTracksRefs[timeSlotRef].indexOf(trackSnapshot.ref.id) !== -1) {
          if (!this.timeSlotTracks[timeSlotRef]) {
            this.timeSlotTracks[timeSlotRef] = [];
          }

          this.timeSlotTracks[timeSlotRef].push(trackSnapshot.data());
        }
      });
    });
  }

  async processSessions() {
    const sessionsSnapshot = await this.firestore.collection('sessions').ref.get();

    sessionsSnapshot.docs.forEach(sessionSnapshot => {
      const data = sessionSnapshot.data();
      this.timeSlots.forEach(timeSlot => {
        const sessionObj = timeSlot.sessions.find(session => session.session.id === sessionSnapshot.ref.id);

        if (sessionObj && this.timeSlotTracksRefs[timeSlot.id].indexOf(sessionObj.track.id) !== -1) {
          const priority = this.timeSlotTracks[timeSlot.id].find(timeSlotTrack => timeSlotTrack.id === sessionObj.track.id).priority;
          this.timeSlotSessions[timeSlot.id].push({
            columnStart: priority,
            columnEnd: priority + 1,
            rowStart: this.countRow(data.startTime.toDate(), timeSlot.startTime),
            rowEnd: this.countRow(data.endTime.toDate(), timeSlot.startTime) - 1,
            name: data.name,
            description: data.description,
          });
        }
      });
    });

    this.showTracks = true;
  }

  createTimesArray(startTime: number, endTime: number) {
    this.times = [];
    for (let i = 0; i < endTime - startTime; i++) {
      this.times.push(startTime + i);
    }
  }

  changeSelectedTimeSlot(id: string) {
    this.selectedTimeSlotId = id;
    const actualTimeSlot = this.timeSlots.find(timeSlot => timeSlot.id === id);
    this.createTimesArray(
      actualTimeSlot.startTime.getHours(),
      actualTimeSlot.endTime.getMinutes() === 0 ? actualTimeSlot.endTime.getHours() : actualTimeSlot.endTime.getHours() + 1
    );
  }

  getRowsCount(selectedTimeSlotId) {
    const selectedTimeSlot = this.timeSlots.find(timeSlot => timeSlot.id === selectedTimeSlotId);
    return selectedTimeSlot && selectedTimeSlot.rowsCount || 1;
  }

  countRow(trackDate: Date, timeSlotDate: Date) {
    const trackTime = trackDate.getMinutes() === 30 ? trackDate.getHours() + 0.5 : trackDate.getHours();
    const timeSlotTime = timeSlotDate.getMinutes() === 30 ? timeSlotDate.getHours() + 0.5 : timeSlotDate.getHours();
    return (trackTime - timeSlotTime) * 2 + 1;
  }

  countRows(startTime: Date, endTime: Date) {
    return (endTime.getHours() - startTime.getHours()) * 2;
  }

  close() {
    this.dialogRef.close();
  }

}
