import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';

enum PhotoVisibilityState {
  Visible = 'visible',
  Hidden = 'hidden'
}

@Component({
  selector: 'app-photo-section',
  templateUrl: './photo-section.component.html',
  styleUrls: ['./photo-section.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('500ms', style({opacity: 1}))
      ]),
      transition(':leave', [
        animate('500ms', style({opacity: 0}))
      ])
    ])
  ]
})
export class PhotoSectionComponent implements OnInit {

  readonly images = [
    'assets/images/show3-min.jpg',
    'assets/images/show2-min.jpg',
    'assets/images/show1-min.jpg',
    'assets/images/show4-min.jpg',
    'assets/images/show5-min.jpg',
    'assets/images/show6-min.jpg',
    'assets/images/show7-min.jpg',
    'assets/images/show8-min.jpg',
    'assets/images/show9-min.jpg',
    'assets/images/show10-min.jpg',
    'assets/images/show11-min.jpg',
    'assets/images/show12-min.jpg',
    'assets/images/show13-min.jpg'
  ]

  constructor() { }

  ngOnInit() {
  }

}
