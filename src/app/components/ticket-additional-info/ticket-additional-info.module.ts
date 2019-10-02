import { NgModule } from '@angular/core';
import { TicketAdditionalInfoComponent } from './ticket-additional-info.component';
import { MatDialogModule, MatButtonModule } from '@angular/material';

@NgModule({
  declarations: [TicketAdditionalInfoComponent],
  exports: [TicketAdditionalInfoComponent],
  imports: [MatDialogModule, MatButtonModule]
})
export class TicketAdditionalInfoModule {}
