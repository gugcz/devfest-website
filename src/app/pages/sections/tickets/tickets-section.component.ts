import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {TeamSectionComponent} from '../team/team-section.component';

@Component({
  selector: 'app-tickets-section',
  templateUrl: './tickets-section.component.html',
  styleUrls: ['./tickets-section.component.scss']
})
export class TicketsSectionComponent {
  constructor(public dialogRef: MatDialogRef<TeamSectionComponent>) {
  }
  close() {
    this.dialogRef.close();
  }
}
