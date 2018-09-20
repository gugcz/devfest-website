import {Component, OnInit} from '@angular/core';
import {TeamSectionComponent} from '../team/team-section.component';
import {MatDialogRef} from '@angular/material';
import {Talk, Speaker} from '../../../database/talk';
import {AngularFireStorage} from 'angularfire2/storage';
import {AngularFirestore} from 'angularfire2/firestore';
import {Organizer} from '../../../database/organizer';

@Component({
  selector: 'app-schedule-section',
  templateUrl: './schedule-section.component.html',
  styleUrls: ['./schedule-section.component.scss']
})
export class ScheduleSectionComponent implements OnInit {

  talks: Talk[];

  constructor(public dialogRef: MatDialogRef<ScheduleSectionComponent>, private firestore: AngularFirestore) {}

  ngOnInit() {
    this.processSchedule();
  }

  async processSchedule() {
    this.talks = [];
    const organizersSnapshot = await this.firestore.collection('schedule').ref.get();
    organizersSnapshot.docs.forEach(talkSnap => {
      const data = talkSnap.data();
      const talk: Talk = {
        title: data.title,
        level: data.level,
        language: data.language,
        length: data.length,
        technologyClass: data.technologyClass,
        columnStart: data.columnStart,
        columnEnd: data.columnEnd,
        trackNumber: data.trackNumber,
        rowStart: data.rowStart,
        rowEnd: data.rowEnd,
        hall: data.hall,
      };

      if (data.speaker) {
        const speaker: Speaker = {
          name: data.speaker.name,
          job: data.speaker.job,
          city: data.speaker.city,
          imageUrl: data.speaker.imageUrl,
        };
        talk.speaker = speaker;
      }
      this.talks.push(talk);
    });
  }

  close() {
    this.dialogRef.close();
  }

}
