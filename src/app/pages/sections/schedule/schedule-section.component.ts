import { Component, OnInit } from '@angular/core';
import {TeamSectionComponent} from '../team/team-section.component';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-schedule-section',
  templateUrl: './schedule-section.component.html',
  styleUrls: ['./schedule-section.component.scss']
})
export class ScheduleSectionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ScheduleSectionComponent>) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

}
