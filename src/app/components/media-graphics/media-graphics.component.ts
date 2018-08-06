import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs';
import {MediaGraphics} from '../../database/media-graphics';
import {AngularFireStorage} from 'angularfire2/storage';

@Component({
    selector: 'app-media-graphics',
    templateUrl: './media-graphics.component.html',
    styleUrls: ['./media-graphics.component.scss']
})
export class MediaGraphicsComponent implements OnInit {

    $graphics: Observable<MediaGraphics[]>;

    constructor(private firestore: AngularFirestore, private firestorege: AngularFireStorage) {
        this.$graphics = this.firestore.collection<MediaGraphics>('mediaGraphics').valueChanges();
    }

    ngOnInit() {
    }

    downloadGraphic(name) {
        this.firestorege.ref('mediaGraphics/' + name).getDownloadURL().subscribe(data => {
            window.open(data, '_blank');
        });
    }

}
