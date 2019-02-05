import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-partner-panel',
  templateUrl: './partner-panel.component.html',
  styleUrls: ['./partner-panel.component.css']
})
export class PartnerPanelComponent implements OnInit {

  @Input() partnerGroupId;

  constructor() { }

  ngOnInit() {
  }

}
