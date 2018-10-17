import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFirestore} from 'angularfire2/firestore';
import {MediaOther} from '../../dto/mediaOther';

@Component({
    selector: 'app-media-others',
    templateUrl: './media-others.component.html',
    styleUrls: ['./media-others.component.scss']
})
export class MediaOthersComponent implements OnInit {

  $press: Observable<MediaOther[]>;

    constructor(private firestore: AngularFirestore) {
      this.$press = this.firestore.collection<MediaOther>('mediaOthers', ref => ref.orderBy('order', 'desc')).valueChanges();
    }

    ngOnInit() {
    }

}
