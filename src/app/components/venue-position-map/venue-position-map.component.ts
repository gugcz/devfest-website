import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-venue-position-map',
  templateUrl: './venue-position-map.component.html',
  styleUrls: ['./venue-position-map.component.scss']
})
export class VenuePositionMapComponent {
  lat = 50.110663;
  lng = 14.509968;
  constructor() {
  }
}
