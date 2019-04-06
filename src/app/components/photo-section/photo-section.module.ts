import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoSectionComponent } from './photo-section.component';
import {SlideshowModule} from 'ng-simple-slideshow';

@NgModule({
  imports: [
    CommonModule,
    SlideshowModule
  ],
  declarations: [
    PhotoSectionComponent,
  ],
  exports: [
    PhotoSectionComponent
  ]
})
export class PhotoSectionComponentModule { }
