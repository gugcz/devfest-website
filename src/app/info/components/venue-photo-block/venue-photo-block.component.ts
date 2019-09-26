import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-venue-photo-block',
  templateUrl: './venue-photo-block.component.html',
  styleUrls: ['./venue-photo-block.component.scss']
})
export class VenuePhotoBlockComponent implements OnInit {

  constructor() {}

  images = [
      'assets/venue/venue1.jpg',
      'assets/venue/venue2.jpg',
      'assets/venue/venue3.png',
      'assets/venue/venue4.jpg',
      'assets/venue/venue5.jpg',
      'assets/venue/venue1.jpg',
      'assets/venue/venue2.jpg',
      'assets/venue/venue3.png',
      'assets/venue/venue4.jpg',
      'assets/venue/venue5.jpg'
  ];

  ngOnInit() {
  }
}
