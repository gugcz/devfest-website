import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-venue-map',
  templateUrl: './venue-map.component.html',
  styleUrls: ['./venue-map.component.scss']
})
export class VenueMapComponent implements OnInit {
  constructor() {}

  showInGoogle() {
    const url = 'https://goo.gl/maps/fixAGEftqFR6UKGSA';
    const win = window.open(url, '_blank');
    win.focus();
  }

  style = [
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#ffffff"
        }
      ]
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#000000"
        },
        {
          lightness: 13
        }
      ]
    },
    {
      featureType: "administrative",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#000000"
        }
      ]
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#144b53"
        },
        {
          lightness: 14
        },
        {
          weight: 1.4
        }
      ]
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [
        {
          color: "#08304b"
        }
      ]
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [
        {
          color: "#0c4152"
        },
        {
          lightness: 5
        }
      ]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#000000"
        }
      ]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#09ffc3"
        },
        {
          lightness: 25
        }
      ]
    },
    {
      featureType: "road.arterial",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#000000"
        }
      ]
    },
    {
      featureType: "road.arterial",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#ff09d8"
        },
        {
          lightness: 16
        }
      ]
    },
    {
      featureType: "road.local",
      elementType: "geometry",
      stylers: [
        {
          color: "#000000"
        }
      ]
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [
        {
          color: "#146474"
        }
      ]
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [
        {
          color: "#021019"
        }
      ]
    }
  ];

  ngOnInit() {}
}
