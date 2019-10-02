import {Component, Input, OnInit} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import { Company } from 'functions/src/tickets/dto/company';

@Component({
  selector: 'app-partner-panel',
  templateUrl: './partner-panel.component.html',
  styleUrls: ['./partner-panel.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({opacity: 0}),
        animate('400ms', style({opacity: 1}))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('500ms', style({opacity: 0}))
      ])
    ])
  ]
})
export class PartnerPanelComponent implements OnInit {

  @Input() groupName: string;
  @Input() companies: Company[];
  @Input() main = false;

  constructor() {
  }

  ngOnInit() {
  }

}
