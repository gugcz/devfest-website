import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-ticket-additional-info',
  templateUrl: './ticket-additional-info.component.html',
  styleUrls: ['./ticket-additional-info.component.scss']
})
export class TicketAdditionalInfoComponent {

  constructor(private dialogRef: MatDialogRef<TicketAdditionalInfoComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

}
