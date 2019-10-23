import { NgModule } from '@angular/core';
import { VenueInfoBlockComponent } from './venue-info-block.component';
import { MatButtonModule } from '@angular/material';

@NgModule({
  declarations: [VenueInfoBlockComponent],
  imports: [MatButtonModule],
  exports: [VenueInfoBlockComponent],
})
export class VenueInfoBlockModule {}
