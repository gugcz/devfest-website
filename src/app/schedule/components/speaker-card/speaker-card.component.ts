import { Component, OnInit, Input } from '@angular/core';
import Tag from 'src/app/data/tag';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-speaker-card',
  templateUrl: './speaker-card.component.html',
  styleUrls: ['./speaker-card.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SpeakerCardComponent implements OnInit {

  @Input() speakerName: string;
  @Input() companyName: string;
  @Input() speakerRef: string;
  @Input() imagePath: string;
  @Input() tag: Tag;

  constructor(private matDialog: MatDialog) { }

  ngOnInit() {
  }

  openSpeakerDetail() {

  }
}
