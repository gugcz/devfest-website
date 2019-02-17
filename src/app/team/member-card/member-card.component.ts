import { Component, OnInit, Input, ɵConsole } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Social } from 'src/app/dto/social';
import { SocialIconsService } from 'src/app/shared/social-icons.service';

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
  styleUrls: ['./member-card.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('infoHide', [
      state(PhotoMode.Normal, style({ opacity: 0 })),
      state(PhotoMode.Cringe, style({ opacity: 1 })),
      transition('* => *', animate('200ms ease-in'))
    ]),
    trigger('fadeImage', [
      state(PhotoVisibilityState.Hidden, style({ opacity: 0 })),
      state(PhotoVisibilityState.Visible, style({ opacity: 1 })),
      transition(PhotoVisibilityState.Hidden + '=>' + PhotoVisibilityState.Visible, animate('200ms ease-in'))
    ])
  ]
})
export class MemberCardComponent implements OnInit {

  private visiblePhoto = false;

  @Input() photoPath: string;
  @Input() photoPathCringe: string;
  @Input() name: string;
  @Input() position: string;
  @Input() socials: Social[];

  photoUrl: string;
  photoUrlCringe: string;

  photoMode: PhotoMode = PhotoMode.Normal;

  constructor(private firestorage: AngularFireStorage, private socialsSer: SocialIconsService) {
  }

  ngOnInit() {
    const photoUrlPromise = this.firestorage.ref(this.photoPath).getDownloadURL().toPromise();
    const photoUrlCringePromise = this.firestorage.ref(this.photoPathCringe).getDownloadURL().toPromise();
    Promise.all([photoUrlPromise, photoUrlCringePromise]).then(urls => {
      this.photoUrl = urls[0];
      this.photoUrlCringe = urls[1];
    })
  }

  get visibilityPhoto(): PhotoVisibilityState {
    return this.visiblePhoto ? PhotoVisibilityState.Visible : PhotoVisibilityState.Hidden;
  }

  changePhotoVisibility() {
    if (!this.visiblePhoto) {
      this.visiblePhoto = true;
    }
  }

  setCringe() {
    this.photoMode = PhotoMode.Cringe;
  }

  setNormal() {
    this.photoMode = PhotoMode.Normal;
  }

}
