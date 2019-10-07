import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import Speaker from 'src/app/data/speaker';
import { animFadeInOut } from 'src/app/animations';
import { DocumentReference } from '@angular/fire/firestore';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-schedule-block',
  templateUrl: './schedule-block.component.html',
  styleUrls: ['./schedule-block.component.scss'],
  animations: [animFadeInOut],
})
export class ScheduleBlockComponent implements OnInit {
  @Input() title: string;
  @Input() level: string;
  @Input() language: 'EN' | 'CZ';
  @Input() duration: number;
  @Input() speaker1: Speaker;
  @Input() speaker2: Speaker;
  @Input() roomName: string;
  @Input() talkRef: DocumentReference;
  @Output() blockClicked = new EventEmitter<DocumentReference>();

  isMobile: boolean;

  constructor(private deviceDetector: DeviceDetectorService) {

  }

  ngOnInit(){
    this.isMobile = this.deviceDetector.isMobile();
  }

  wc_hex_is_light(color) {
    const hex = color.replace('#', '');
    const c_r = parseInt(hex.substr(0, 2), 16);
    const c_g = parseInt(hex.substr(2, 2), 16);
    const c_b = parseInt(hex.substr(4, 2), 16);
    const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
    return brightness > 155;
  }

  getShortName(fullName) { 
    const split = fullName.split(' ');
    return split[0] + ' ' + split[split.length - 1];
  }
}
