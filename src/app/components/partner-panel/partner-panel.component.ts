import { Component, OnInit, Input } from '@angular/core';
import { Company } from '../../data/partner';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-partner-panel',
  templateUrl: './partner-panel.component.html',
  styleUrls: ['./partner-panel.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({opacity: 0}),
        animate('200ms', style({opacity: 1}))
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
