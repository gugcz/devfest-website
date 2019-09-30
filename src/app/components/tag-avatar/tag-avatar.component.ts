import { Component, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
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
    ]),
    trigger('widthHover', [
      state('false', style({ width: '100%' })),
      state('true', style({ width: '95%' })),
      transition('false <=> true', animate('100ms ease-in'))
    ])
  ]
})
export class TagAvatarComponent implements AfterViewInit {

  @Input() firestorageImagePath = 'speakers/no-image.jpg';
  @Input() tagColor = '#fff';
  @Input() name: string;
  @Input() hoverEnabled = false;
  @Output() avatarClicked = new EventEmitter<void>();

  public imageUrl: Observable<string>;
  public downloadedPhoto = false;
  public hovered = false;

  constructor(private fireStorage: AngularFireStorage) { }

  ngAfterViewInit() {
  }

  changePhotoDownloadState() {
    this.downloadedPhoto = true;
  }

  loadImage() {
    this.imageUrl = this.fireStorage.ref(this.firestorageImagePath).getDownloadURL();
  }

  enableHover() {
    if (this.hoverEnabled) {
      this.hovered = true;
    }
  }

  disableHover() {
    if (this.hoverEnabled) {
      this.hovered = false;
    }
  }

}
