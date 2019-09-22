import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info.component';
import { InfoRoutingModule } from './info-routing.module';
import { VenueComponent } from './components/venue/venue.component';
import { InfoBlockComponent } from './components/info-block/info-block.component';

@NgModule({
  declarations: [
    InfoComponent,
    VenueComponent,
    InfoBlockComponent
  ],
  imports: [
    CommonModule,
    InfoRoutingModule
  ]
})
export class InfoModule {}
