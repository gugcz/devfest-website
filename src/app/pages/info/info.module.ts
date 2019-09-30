import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info.component';
import { InfoRoutingModule } from './info-routing.module';
import { AgmCoreModule } from '@agm/core';
import { VenueModule } from 'src/app/components/venue/venue.module';

@NgModule({
  declarations: [
    InfoComponent,
  ],
  imports: [
    VenueModule,
    CommonModule,
    InfoRoutingModule,
    AgmCoreModule
  ]
})
export class InfoModule {}
