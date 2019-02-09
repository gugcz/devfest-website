import { Component, OnInit, Input } from '@angular/core';
import { Company } from 'src/app/dto/partner';

@Component({
  selector: 'app-partner-panel',
  templateUrl: './partner-panel.component.html',
  styleUrls: ['./partner-panel.component.css']
})
export class PartnerPanelComponent implements OnInit {

  @Input() groupName: string;
  @Input() companies: Company[];

  constructor() {
   }

  ngOnInit() {
  }

}
