import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {AngularFireStorage} from 'angularfire2/storage';
import {MediaGraphics} from '../../dto/mediaGraphics';

@Component({
  selector: 'app-media-graphics',
  templateUrl: './media-graphics.component.html',
  styleUrls: ['./media-graphics.component.scss']
})
export class MediaGraphicsComponent implements OnInit {

  imageUrls: Object[];

  constructor(private firestore: AngularFirestore, private firestorege: AngularFireStorage) {
    this.imageUrls = [];
    this.firestore.collection<MediaGraphics>('mediaGraphics', ref => ref.orderBy('position')).valueChanges().subscribe(data => {
      this.imageUrls = [];
      data.forEach(it => this.addGraphic(it.file, it.name));
    });
  }

  ngOnInit() {
  }

  downloadGraphic(url) {
    window.open(url, '_blank');
  }

  addGraphic(downloadName, fileName) {
    this.firestorege.ref('mediaGraphics/' + downloadName).getDownloadURL().subscribe(imageUrl => {
      this.firestorege.ref('mediaGraphics/thumb_' + downloadName).getDownloadURL().subscribe(thumbUrl => {
        this.imageUrls.push({url: imageUrl, thumbUrl: thumbUrl, name: fileName});
      });
    });
  }


}
