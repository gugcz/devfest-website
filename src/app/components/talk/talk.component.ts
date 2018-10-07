import {Component, Input, OnInit} from '@angular/core';
import {Talk} from '../../database/talk';
import {AngularFireStorage} from 'angularfire2/storage';

@Component({
  selector: 'app-talk',
  templateUrl: './talk.component.html',
  styleUrls: ['./talk.component.scss']
})
export class TalkComponent implements OnInit {

  @Input() talk: Talk;

  constructor() {}

  ngOnInit() {
  }

}
