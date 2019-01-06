import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Social } from 'src/app/dto/social';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({opacity: 0}),
        animate('500ms', style({opacity: 1}))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('500ms', style({opacity: 0}))
      ])
    ]),
    trigger('fadeImage', [
      state('false', style({opacity: 0})),
      state('true', style({opacity: 1})),
      transition('false <=> true', animate(1000))
    ])
  ]
})
export class MemberCardComponent implements OnInit {

  @Input() photoPath: string;
  @Input() name: string;
  @Input() position: string;
  @Input() socials: Social[];

  visiblePhoto: boolean = false;

  photoUrl: Observable<string>;

  constructor(private firestore: AngularFirestore, private firestorage: AngularFireStorage,
     private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
       iconRegistry.addSvgIcon(
         'twitter',
         sanitizer.bypassSecurityTrustResourceUrl('assets/icons/twitter.svg')
       )
      }

  ngOnInit() {
    this.photoUrl = this.firestorage.ref(this.photoPath).getDownloadURL();
  }

}
