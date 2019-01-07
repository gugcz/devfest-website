import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Social } from 'src/app/dto/social';
import { SocialIconsService } from 'src/app/shared/social-icons.service';

enum PhotoVisibilityState {
  Visible = 'visible',
  Hidden = 'hidden'
}

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('500ms', style({opacity: 1}))
      ]),
      transition(':leave', [
        animate('500ms', style({opacity: 0}))
      ])
    ]),
    trigger('fadeImage', [
      state(PhotoVisibilityState.Hidden, style({opacity: 0})),
      state(PhotoVisibilityState.Visible, style({opacity: 1})),
      transition('* => *', animate('200ms ease-in'))
    ]),
    trigger('toggle', [
      state(PhotoVisibilityState.Hidden, style({ transform: 'translateY(0)'})),
      state(PhotoVisibilityState.Visible, style({ transform: 'translateY(168px)'})),
      transition('* => *', animate('180ms ease-in'))
    ])
  ]
})
export class MemberCardComponent implements OnInit {

  private visiblePhoto = false;

  @Input() photoPath: string;
  @Input() name: string;
  @Input() position: string;
  @Input() socials: Social[];

  photoUrl: Observable<string>;

  constructor(private firestorage: AngularFireStorage, private socialsSer: SocialIconsService) {
  }

  ngOnInit() {
    this.photoUrl = this.firestorage.ref(this.photoPath).getDownloadURL();
  }

  get visibilityPhoto(): PhotoVisibilityState {
    return this.visiblePhoto ? PhotoVisibilityState.Visible : PhotoVisibilityState.Hidden;
  }

  changePhotoVisibility() {
    if (this.visiblePhoto) {
      this.visiblePhoto = false;
    } else {
      this.visiblePhoto = true;
    }
  }

}
