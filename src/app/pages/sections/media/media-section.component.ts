import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {TeamSectionComponent} from '../team/team-section.component';

@Component({
  selector: 'app-media-section',
  templateUrl: './media-section.component.html',
  styleUrls: ['./media-section.component.scss']
})
export class MediaSectionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<TeamSectionComponent>) {
  }

  ngOnInit() {
  }

  close(){
    this.dialogRef.close();
  }

}
