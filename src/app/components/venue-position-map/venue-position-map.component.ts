import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-venue-position-map',
  templateUrl: './venue-position-map.component.html',
  styleUrls: ['./venue-position-map.component.scss']
})
export class VenuePositionMapComponent {
  lat = 50.110443;
  lng = 14.509967899999992;
  constructor() {
  }

  showInGoogle() {
    const url = 'https://goo.gl/maps/xizNF3ZVgVk';
    const win = window.open(url, '_blank');
    win.focus();
  }
}
