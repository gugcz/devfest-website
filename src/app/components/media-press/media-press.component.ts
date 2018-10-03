import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFirestore} from 'angularfire2/firestore';
import {MediaPress} from '../../database/media-press';

@Component({
    selector: 'app-media-press',
    templateUrl: './media-press.component.html',
    styleUrls: ['./media-press.component.scss']
})
export class MediaPressComponent implements OnInit {

    $press: Observable<MediaPress[]>;

    constructor(private firestore: AngularFirestore) {
        this.$press = this.firestore.collection<MediaPress>('mediaPress').valueChanges();
    }

    ngOnInit() {
    }
}
