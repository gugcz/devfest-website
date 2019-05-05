import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFireStorage} from '@angular/fire/storage';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Social} from '../../data/social';
import {SocialIconsService} from '../../services/social-icons.service';

export enum PhotoVisibilityState {
  Visible = 'visible',
  Hidden = 'hidden'
}

export enum PhotoMode {
  Normal = 'normal',
  Cringe = 'cringe'
}

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('600ms', style({opacity: 1}))
      ]),
      transition(':leave', [
        animate('300ms', style({opacity: 0}))
      ])
    ]),
    trigger('fadeImage', [
      state(PhotoVisibilityState.Hidden, style({opacity: 0})),
      state(PhotoVisibilityState.Visible, style({opacity: 1})),
      transition(PhotoVisibilityState.Hidden + '=>' + PhotoVisibilityState.Visible, animate('200ms ease-in'))
    ]),
    trigger('infoHide', [
      state(PhotoMode.Normal, style({opacity: 0})),
      state(PhotoMode.Cringe, style({opacity: 1})),
      transition('* => *', animate('300ms ease-in'))
    ]),
  ]
})
export class MemberCardComponent implements OnInit {

  @Input() photoPath: string;
  @Input() photoPathCringe: string;
  @Input() name: string;
  @Input() position: string;
  @Input() socials: Social[];
  photoUrl: Observable<string>;
  photoUrlCringe: Observable<string>;
  photoMode: PhotoMode = PhotoMode.Normal;
  private visiblePhotoNormal = false;
  private visiblePhotoCringe = false;

  constructor(private firestorage: AngularFireStorage, private el: ElementRef, private socialsSer: SocialIconsService) {

  }

  get visibilityPhotoNormal(): PhotoVisibilityState {
    return this.visiblePhotoNormal && (this.photoMode === PhotoMode.Normal) ? PhotoVisibilityState.Visible : PhotoVisibilityState.Hidden;
  }

  get visibilityPhotoCringe(): PhotoVisibilityState {
    return this.visiblePhotoCringe && (this.photoMode === PhotoMode.Cringe) ? PhotoVisibilityState.Visible : PhotoVisibilityState.Hidden;
  }

  ngOnInit() {
    this.photoUrl = this.firestorage.ref(this.photoPath).getDownloadURL();
    this.photoUrlCringe = this.firestorage.ref(this.photoPathCringe).getDownloadURL();
  }

  changePhotoVisibilityNormal() {
    if (!this.visiblePhotoNormal) {
      this.visiblePhotoNormal = true;
    }
  }

  changePhotoVisibilityCringe() {
    if (!this.visiblePhotoCringe) {
      this.visiblePhotoCringe = true;
    }
  }

  setCringe() {
    this.photoMode = PhotoMode.Cringe;
  }

  setNormal() {
    this.photoMode = PhotoMode.Normal;
  }

}
