import { Component, Input, AfterViewInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tag-avatar',
  templateUrl: './tag-avatar.component.html',
  styleUrls: ['./tag-avatar.component.scss']
})
export class TagAvatarComponent implements AfterViewInit {

  @Input() firestorageImagePath = 'speakers/no-image.jpg';
  @Input() tagColor = '#fff';
  public imageUrl: Observable<string>;

  constructor(private fireStorage: AngularFireStorage) { }

  ngAfterViewInit() {
    this.imageUrl = this.fireStorage.ref(this.firestorageImagePath).getDownloadURL();
  }

}
