import {Component, Input, OnInit} from '@angular/core';
import {Talk} from '../../database/talk';
import {AngularFireStorage} from 'angularfire2/storage';
import {AngularFirestore} from 'angularfire2/firestore';

@Component({
  selector: 'app-talk',
  templateUrl: './talk.component.html',
  styleUrls: ['./talk.component.scss']
})
export class TalkComponent implements OnInit {

  @Input() talk: Talk;

  constructor(private storage: AngularFireStorage) {
  }

  ngOnInit() {
    this.talk.speakers.forEach(async speaker => {
      speaker.photo = await this.findPhoto(speaker.photo);
    });
  }

  async findPhoto(folder: string) {
    return await this.storage.ref(folder).getDownloadURL().toPromise();
  }

}
