import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Images } from 'src/app/data/images';
import { trigger, state, style, transition, animate } from '@angular/animations';

export enum PhotoState {
  Loading = 'Loading',
  Downloaded = 'Downloaded'
}

@Component({
  selector: 'app-photo-panel',
  templateUrl: './photo-panel.component.html',
  styleUrls: ['./photo-panel.component.scss'],
  animations: [trigger('fadeImage', [
    state(PhotoState.Loading, style({ opacity: 0 })),
    state(PhotoState.Downloaded, style({ opacity: 1 })),
    transition('* <=> *', animate(500))
  ])]
})
export class PhotoPanelComponent{

  images: Observable<string>[];
  imagesColRef: Observable<Images[]>;
  visibilityOfPhoto: PhotoState[];
  defaultStateVisibility: PhotoState.Loading;

  constructor(private afStorage: AngularFireStorage, private afStore: AngularFirestore) {

  }

  loadImages() {
    this.imagesColRef = this.afStore
      .collection<Images>('images', ref => ref.where('name', '==', 'past-images').limit(1))
      .valueChanges();
    this.imagesColRef.subscribe((data) => {
      this.images = null;
      this.visibilityOfPhoto = [];
      if (data.length > 0 && data != null) {
        const rightCol = data[0];
        this.images = rightCol.images.map((imagePath) => this.afStorage.ref(imagePath).getDownloadURL());
        this.visibilityOfPhoto.push(PhotoState.Loading);
      }
    });
  }


  setVisibilityOfImage(index) {
    this.visibilityOfPhoto[index] = PhotoState.Downloaded;
  }

  goToGallery(){
    window.open('https://photos.app.goo.gl/HZVpzAtDejCNnqUXA', '_blank');
  }

}
