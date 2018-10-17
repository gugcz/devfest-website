import {Component, Input, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {AngularFireStorage} from 'angularfire2/storage';
import {animate, style, transition, trigger} from '@angular/animations';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';
import {Organizer} from '../../dto/organizer';

@Component({
  selector: 'app-organizer-card',
  templateUrl: './organizer-card.component.html',
  styleUrls: ['./organizer-card.component.scss'],
  animations: [
    trigger(
      'slideInRight',
      [
        transition(
          ':enter', [
            style({transform: 'translateY(100%)', opacity: 0}),
            animate('500ms', style({transform: 'translateY(0)', opacity: 1}))
          ]
        ),
        transition(
          ':leave', [
            style({transform: 'translateY(0)', 'opacity': 1}),
            animate('500ms', style({transform: 'translateY(-100%)', opacity: 0}))
          ]
        )
      ]), trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate('1500ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('1500ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class OrganizerCardComponent implements OnInit {

  @Input() id: string;
  organizer: Organizer;
  profileUrl: Observable<string | null>;

  constructor(private fireStore: AngularFirestore, private storage: AngularFireStorage, private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'facebook',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/socials/facebook.svg'));
    iconRegistry.addSvgIcon(
      'twitter',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/socials/twitter.svg'));
    iconRegistry.addSvgIcon(
      'instagram',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/socials/instagram.svg'));
      iconRegistry.addSvgIcon(
          'googleplus',
          sanitizer.bypassSecurityTrustResourceUrl('assets/icons/socials/google.svg'));
      iconRegistry.addSvgIcon(
          'linkedin',
          sanitizer.bypassSecurityTrustResourceUrl('assets/icons/socials/linkedin.svg'));
      iconRegistry.addSvgIcon(
          'youtube',
          sanitizer.bypassSecurityTrustResourceUrl('assets/icons/socials/youtube.svg'));
  }

  ngOnInit() {
    this.fireStore.collection<Organizer>('organizers').doc<Organizer>(this.id).valueChanges().subscribe((data) => {
      this.organizer = data;
      const ref = this.storage.ref(this.organizer.photo);
      this.profileUrl = ref.getDownloadURL();
    });
  }

}
