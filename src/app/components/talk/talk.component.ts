import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AngularFireStorage} from 'angularfire2/storage';
import {Observable} from 'rxjs';
import {Talk} from '../../customObjects/talk';

@Component({
  selector: 'app-talk',
  templateUrl: './talk.component.html',
  styleUrls: ['./talk.component.scss']
})
export class TalkComponent implements OnInit, OnChanges {

  @Input() talk: Talk;
  talkSubtitle: string;

  constructor(private storage: AngularFireStorage) {
  }

  ngOnInit() {
    this.talk.speakers.forEach(async speaker => {
      if (!(speaker.photo instanceof Observable)) {
        speaker.photo = this.storage.ref(speaker.photo).getDownloadURL();
        speaker['showPhoto'] = true;
      }
    });
    this.talkSubtitle = [this.talk.level, this.talk.language, ((this.talk.hall && !this.talk.hideHall) ?
       this.talk.hall.name : ''), this.talk.length]
      .filter(item => item)
      .join(' / ');
  }

  ngOnChanges(changes: SimpleChanges) {

  }


}
