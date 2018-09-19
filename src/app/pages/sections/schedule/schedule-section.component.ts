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

  talk: Talk;

  constructor(public dialogRef: MatDialogRef<ScheduleSectionComponent>) {
    const speaker: Speaker = {name: 'Ozzy Osbourne', job: 'Metal', city: 'Birmingham'};
    this.talk = {
      title: 'Bark at the moon',
      speaker: speaker,
      level: 'Beginner',
      language: 'English',
      length: '30 min',
      imageUrl: 'https://www.welt.de/img/kultur/pop/mobile155156484/7982506097-ci102l-w1024/Amy-US-Premiere-Hosted-By-Lucian-Grainge-CBE-Universal-Music-Group-And-A24-4.jpg',
      technologyClass: 'firebase'
    };
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

}
