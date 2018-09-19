import {Component, OnInit} from '@angular/core';
import {TeamSectionComponent} from '../team/team-section.component';
import {MatDialogRef} from '@angular/material';
import {Talk, Speaker} from '../../../database/talk';

@Component({
  selector: 'app-schedule-section',
  templateUrl: './schedule-section.component.html',
  styleUrls: ['./schedule-section.component.scss']
})
export class ScheduleSectionComponent implements OnInit {

  talks: Talk[];

  constructor(public dialogRef: MatDialogRef<ScheduleSectionComponent>) {
    const speaker: Speaker = {name: 'Ozzy Osbourne', job: 'Metal', city: 'Birmingham', imageUrl: 'https://www.welt.de/img/kultur/pop/mobile155156484/7982506097-ci102l-w1024/Amy-US-Premiere-Hosted-By-Lucian-Grainge-CBE-Universal-Music-Group-And-A24-4.jpg'};
    const keynote: Talk = {title: 'Keynote', columnStart: 1, columnEnd: 3, rowStart: 1, rowEnd: 1};
    const talk1: Talk = {title: 'Bark at the moon', rowStart: 2, rowEnd: 3, trackNumber: 1, speaker: speaker, level: 'Beginner', language: 'English', technologyClass: 'firebase'};
    const talk2: Talk = {title: 'Bark at the moon', rowStart: 2, rowEnd: 3, trackNumber: 2, speaker: speaker, level: 'Beginner', language: 'English', technologyClass: 'android'};
    const talk3: Talk = {title: 'Bark at the moon', rowStart: 2, rowEnd: 2, trackNumber: 3, speaker: speaker, level: 'Beginner', language: 'English', technologyClass: 'dart'};
    const talk4: Talk = {title: 'Bark at the moon', rowStart: 3, rowEnd: 3, trackNumber: 3, speaker: speaker, level: 'Beginner', language: 'English', technologyClass: 'firebase'};
    this.talks = [keynote, talk1, talk2, talk3, talk4];
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

}
