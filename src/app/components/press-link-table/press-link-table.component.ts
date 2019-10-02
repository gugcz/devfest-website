import {Component, Input} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import PressLink from '../../data/press-link';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-press-link-table',
  templateUrl: './press-link-table.component.html',
  styleUrls: ['./press-link-table.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('150ms', style({opacity: 1}))
      ]),
      transition(':leave', [
        animate('150ms', style({opacity: 0}))
      ])
    ])
  ]
})
export class PressLinkTableComponent {

  @Input() links: PressLink[];
  @Input() title: string;

  public isMobile: boolean;

  constructor(private deviceService: DeviceDetectorService) {
    this.isMobile = this.deviceService.isMobile();
  }

  goToLink(link: string) {
    window.location.href = link;
  }

}
