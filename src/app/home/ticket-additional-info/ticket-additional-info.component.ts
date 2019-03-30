import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ticket-additional-info',
  templateUrl: './ticket-additional-info.component.html',
  styleUrls: ['./ticket-additional-info.component.css']
})
export class TicketAdditionalInfoComponent {

  constructor(private dialogRef: MatDialogRef<TicketAdditionalInfoComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

}
