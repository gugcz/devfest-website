import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketAdditionalInfoComponent } from './ticket-additional-info.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule
  ],
  declarations: [
    TicketAdditionalInfoComponent,
  ],
  exports: [
    TicketAdditionalInfoComponent
  ]
})
export class TicketAdditionalInfoComponentModule { }
