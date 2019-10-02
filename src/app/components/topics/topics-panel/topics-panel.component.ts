import { Component, OnInit } from '@angular/core';
import { animFadeInOut } from 'src/app/animations';
import { Observable } from 'rxjs';
import Tag from 'src/app/data/tag';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-topics-panel',
  templateUrl: './topics-panel.component.html',
  styleUrls: ['./topics-panel.component.scss'],
  animations: [animFadeInOut],
})
export class TopicsPanelComponent {
  data: Observable<Tag[]>;

  constructor(private firestore: AngularFirestore) {}

  loadData() {
    this.data = this.firestore.collection<Tag>('tags').valueChanges();
  }
}
