import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';

import { MatButtonModule } from '@angular/material/button';
import { PhotoSectionComponent } from './photo-section/photo-section.component';
import {SlideshowModule} from 'ng-simple-slideshow';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    MatButtonModule,
    SlideshowModule
  ],
  declarations: [
    HomeComponent,
    PhotoSectionComponent
  ]
})
export class HomeModule { }
