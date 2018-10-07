import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {AngularFirestore} from 'angularfire2/firestore';
import {TimeSlot, TimeSlotItem} from '../../../database/time-slot';

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
      const id = timeSlotSnap.id;
      this.timeSlotTracksRefs[id] = [];

      this.selectedTimeSlotId = data.primary ? id : this.selectedTimeSlotId;

      const timeSlotsItems: TimeSlotItem[] = data.sessions.map(timeSlotItem => {
        if (this.timeSlotTracksRefs[id].indexOf(timeSlotItem.track.id) === -1) {
          this.timeSlotTracksRefs[id].push(timeSlotItem.track.id);
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
        id: id,
        text: data.text,
        endTime: data.endTime.toDate(),
        startTime: data.startTime.toDate(),
        sessions: timeSlotsItems,
        rowsCount: this.countRows(data.startTime.toDate(), data.endTime.toDate())
      };

      this.timeSlotSessions[id] = [];

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

          this.timeSlotTracks[timeSlotRef].push({...trackSnapshot.data(), id: trackSnapshot.ref.id});
        }
      });
    });
    Object.keys(this.timeSlotTracksRefs).forEach(timeSlotRef => {
      this.timeSlotTracks[timeSlotRef].sort((a, b) => a.order > b.order ? 1 : -1);
    });
  }

  async processSessions() {
    const sessionsSnapshot = await this.firestore.collection('sessions').ref.get();

    sessionsSnapshot.docs.forEach(async sessionSnapshot => {
      const data = sessionSnapshot.data();
      await this.timeSlots.forEach(async timeSlot => {
        const sessionObj = timeSlot.sessions.find(session => session.session.id === sessionSnapshot.ref.id);

        if (sessionObj && this.timeSlotTracksRefs[timeSlot.id].indexOf(sessionObj.track.id) !== -1) {
          let columnStart = this.timeSlotTracks[timeSlot.id].find(timeSlotTrack => timeSlotTrack.id === sessionObj.track.id).order;
          let columnEnd = columnStart + 1;
          if (data.fullRow) {
            columnStart = 1;
            columnEnd = this.getColumnsCount(timeSlot.id) + 1;
          }

          const speakers = [];
          if (data.speakers) {
            data.speakers.forEach(async speakerRef => {
              const speakerSnapshot = await this.firestore.doc(speakerRef).ref.get();
              speakers.push(speakerSnapshot.data());
            });
          }

          const tagSnap = await this.firestore.doc(data.tag).ref.get();
          const tag = tagSnap.data();

          this.timeSlotSessions[timeSlot.id].push({
            columnStart: columnStart,
            columnEnd: columnEnd,
            rowStart: this.countRow(data.startTime.toDate(), timeSlot.startTime),
            rowEnd: this.countRow(data.endTime.toDate(), timeSlot.startTime),
            startHour: data.startTime.toDate(),
            endHour: data.startTime.toDate(),
            name: data.name,
            description: data.description,
            speakers: speakers,
            level: data.level,
            language: data.language,
            length: data.length,
            hall: data.hall,
            tag: tag
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

  getColumnsCount(selectedTimeSlotId) {
    return this.timeSlotTracks[selectedTimeSlotId] && this.timeSlotTracks[selectedTimeSlotId].length || 0;
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

  getMobileRowsCount(selectedTimeSlotId) {
    const timeSlot = this.timeSlots.find(it => it.id === selectedTimeSlotId);
    const hours = timeSlot && (timeSlot.endTime.getHours() - timeSlot.startTime.getHours()) || 1;
    const tracksCount = this.timeSlotTracks[selectedTimeSlotId] &&  this.timeSlotTracks[selectedTimeSlotId].length || 1;
    return tracksCount * hours;
  }

  countMobileRow(talk, selectedTimeSlotId) {
    const timeSlot = this.timeSlots.find(it => it.id === selectedTimeSlotId);
    console.log(talk);
    return (talk.startHour.getHours() - timeSlot.startTime.getHours()) * this.timeSlotTracks[selectedTimeSlotId].length + talk.hall.order;
  }

  close() {
    this.dialogRef.close();
  }

}
