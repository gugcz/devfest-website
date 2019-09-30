import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFireStorage} from '@angular/fire/storage';
import {PhotoState} from '../../pages/partners/partner-logo/partner-logo.component';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-top-partner-logo',
  templateUrl: './top-partner-logo.component.html',
  styleUrls: ['./top-partner-logo.component.scss'],
  animations: [trigger('fadeImage', [
    state(PhotoState.Loading, style({opacity: 0})),
    state(PhotoState.Downloaded, style({opacity: 1})),
    transition('* <=> *', animate(200))
  ])]
})
export class TopPartnerLogoComponent implements OnInit {

  @Input() url: string;
  @Input() name: string;
  @Input() photoPath: string;
  @Input() main = false;
  imageUrl: Observable<string>;
  visibility: PhotoState = PhotoState.Loading;

  constructor(private afStorage: AngularFireStorage) {
  }

  ngOnInit() {
    this.imageUrl = this.afStorage.ref(this.photoPath).getDownloadURL();
  }

  setVisibilityOfLogo() {
    this.visibility = PhotoState.Downloaded;
  }

}
