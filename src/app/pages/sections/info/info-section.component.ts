import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {TeamSectionComponent} from '../team/team-section.component';

@Component({
  selector: 'app-info-section',
  templateUrl: './info-section.component.html',
  styleUrls: ['./info-section.component.scss']
})
export class InfoSectionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<TeamSectionComponent>) {
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

}
