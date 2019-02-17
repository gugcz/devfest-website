import { Component, OnInit } from '@angular/core';
import { SocialIconsService } from '../social-icons.service';

@Component({
  selector: 'app-contribute-panel',
  templateUrl: './contribute-panel.component.html',
  styleUrls: ['./contribute-panel.component.css']
})
export class ContributePanelComponent implements OnInit {

  constructor( private socialsSer: SocialIconsService) { }

  ngOnInit() {
  }

}
