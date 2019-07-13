import {Component, Input, OnInit} from '@angular/core';
import Social from '../../data/social';

@Component({
  selector: 'app-member-panel',
  templateUrl: './member-panel.component.html',
  styleUrls: ['./member-panel.component.scss']
})
export class MemberPanelComponent implements OnInit {

  @Input() photoPath: string;
  @Input() photoPathCringe: string;
  @Input() name: string;
  @Input() position: string;
  @Input() socials: Social[];
  @Input() email?: string;
  @Input() phone?: string;


  constructor() {
  }

  ngOnInit(): void {
  }

}
