import { NgModule } from '@angular/core';
import { VenuePhotoBlockComponent } from './venue-photo-block.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [VenuePhotoBlockComponent],
  exports: [VenuePhotoBlockComponent],
  imports: [CommonModule]
})
export class VenuePhotoBlockModule {}
