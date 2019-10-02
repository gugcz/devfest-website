import { NgModule } from '@angular/core';
import { VenueMapComponent } from './venue-map.component';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [VenueMapComponent],
  exports: [VenueMapComponent],
  imports: [AgmCoreModule],
})
export class VenueMapModule {}
