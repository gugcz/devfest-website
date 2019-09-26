import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info.component';
import { InfoRoutingModule } from './info-routing.module';
import { VenueComponent } from './components/venue/venue.component';
import { VenueInfoBlockComponent } from './components/venue-info-block/venue-info-block.component';
import { AgmCoreModule } from '@agm/core';
import { VenueMapComponent } from './components/venue-map/venue-map.component';
import { VenuePhotoBlockComponent } from './components/venue-photo-block/venue-photo-block.component';

@NgModule({
  declarations: [
    InfoComponent,
    VenueComponent,
    VenueInfoBlockComponent,
    VenueMapComponent,
    VenuePhotoBlockComponent
  ],
  imports: [
    CommonModule,
    InfoRoutingModule,
    AgmCoreModule
  ]
})
export class InfoModule {}
