import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Talk} from '../../database/talk';
import {AngularFireStorage} from 'angularfire2/storage';
import {AngularFirestore} from 'angularfire2/firestore';

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
  }

  ngOnChanges(changes: SimpleChanges) {
    this.talk.speakers.forEach(async speaker => {
      speaker.photo = await this.findPhoto(speaker.photo);
    });
    this.talkSubtitle = [this.talk.level, this.talk.language, this.talk.hall && this.talk.hall.name || '', this.talk.length]
      .filter(item => item)
      .join(' / ');
  }

  async findPhoto(folder: string) {
    return await this.storage.ref(folder).getDownloadURL().toPromise();
  }

}
