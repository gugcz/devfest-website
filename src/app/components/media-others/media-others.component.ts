import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {MediaPress} from '../../database/media-press';
import {AngularFirestore} from 'angularfire2/firestore';

@Component({
    selector: 'app-media-others',
    templateUrl: './media-others.component.html',
    styleUrls: ['./media-others.component.scss']
})
export class MediaOthersComponent implements OnInit {

    $press: Observable<MediaPress[]>;

    constructor(private firestore: AngularFirestore) {
        this.$press = this.firestore.collection<MediaPress>('mediaOthers', ref => ref.orderBy('order', 'desc')).valueChanges();
    }

    ngOnInit() {
    }

}
