import {Component, Input, OnInit} from '@angular/core';
import {Talk} from '../../database/talk';

@Component({
  selector: 'app-talk',
  templateUrl: './talk.component.html',
  styleUrls: ['./talk.component.scss']
})
export class TalkComponent implements OnInit {

  @Input() talk: Talk;

  constructor() {
    console.log(this.talk);
  }

  ngOnInit() {
  }

}
