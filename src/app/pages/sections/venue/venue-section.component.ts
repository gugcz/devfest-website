import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-venue-section',
  templateUrl: './venue-section.component.html',
  styleUrls: ['./venue-section.component.scss']
})
export class VenueSectionComponent {
  constructor(public dialogRef: MatDialogRef<VenueSectionComponent>) {
  }

  close() {
    this.dialogRef.close();
  }
}
