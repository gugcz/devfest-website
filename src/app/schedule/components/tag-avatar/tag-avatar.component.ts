import { Component, Input, AfterViewInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-tag-avatar',
  templateUrl: './tag-avatar.component.html',
  styleUrls: ['./tag-avatar.component.scss'],
  animations: [
    trigger('photoVisible', [
      state('false', style({ opacity: 0 })),
      state('true', style({ opacity: 1 })),
      transition('false => true', animate('300ms ease-in'))
    ])
  ]
})
export class TagAvatarComponent implements AfterViewInit {

  @Input() firestorageImagePath = 'speakers/no-image.jpg';
  @Input() tagColor = '#fff';
  @Input() name: string;

  public imageUrl: Observable<string>;
  public downloadedPhoto = false;

  constructor(private fireStorage: AngularFireStorage) { }

  ngAfterViewInit() {
    this.imageUrl = this.fireStorage.ref(this.firestorageImagePath).getDownloadURL();
  }

  changePhotoDownloadState() {
    this.downloadedPhoto = true;
  }

}
