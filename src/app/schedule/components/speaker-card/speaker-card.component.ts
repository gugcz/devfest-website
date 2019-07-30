import { Component, OnInit, Input } from '@angular/core';
import Tag from 'src/app/data/tag';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatDialog } from '@angular/material';
import { DeviceDetectorService } from 'ngx-device-detector';
import { SpeakerDetailComponent } from '../speaker-detail/speaker-detail.component';

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

  private isMobile: boolean;

  constructor(private matDialog: MatDialog, private deviceService: DeviceDetectorService) {
    this.isMobile = this.deviceService.isMobile();
  }


  ngOnInit() {
  }

  openSpeakerDetail() {
    const config = {
      width: '800px',
      height: '500px',
      data: {
        ref: this.speakerRef
      },
      autoFocus: false,
    };
    const mobiconfig = {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      data: {
        ref: this.speakerRef
      },
      autoFocus: false,
    };
    this.matDialog.open(SpeakerDetailComponent, this.isMobile ? mobiconfig : config);
  }
}
