import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {animate, style, transition, trigger} from '@angular/animations';
import {AngularFirestore} from 'angularfire2/firestore';
import {AngularFireStorage} from 'angularfire2/storage';
import {Observable} from 'rxjs';

interface Speaker {
  id: string;
  name: string;
  companies: Observable<string>;
  about: string;
  photo: Observable<string>;
  residence: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  googleplus: string;
  youtube: string;
}

@Component({
  selector: 'app-speakers-section',
  templateUrl: './speakers-section.component.html',
  styleUrls: ['./speakers-section.component.scss'],
  animations: [trigger('fadeInOut', [
    transition(':enter', [   // :enter is alias to 'void => *'
      style({ opacity: 0 }),
      animate('200ms', style({ opacity: 1 }))
    ]),
    transition(':leave', [   // :leave is alias to '* => void'
      animate('500ms', style({ opacity: 0 }))
    ])
  ])]
})
export class SpeakersSectionComponent implements OnInit {

  speakers: Speaker[] = [];

  constructor(public dialogRef: MatDialogRef<SpeakersSectionComponent>, private iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer, private router: Router, private firestore: AngularFirestore, private storage: AngularFireStorage) {
    iconRegistry.addSvgIcon(
      'facebook',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/facebook.svg'));
    iconRegistry.addSvgIcon(
      'twitter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/twitter.svg'));
    iconRegistry.addSvgIcon(
      'instagram',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/instagram.svg'));
    iconRegistry.addSvgIcon(
      'googleplus',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/google.svg'));
    iconRegistry.addSvgIcon(
      'linkedin',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/linkedin.svg'));
    iconRegistry.addSvgIcon(
      'youtube',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/youtube.svg'));
  }

  ngOnInit() {
    this.processSpeakers();
  }

  async processSpeakers() {
    const speakersSnapshot = await this.firestore.collection('speakers').ref.get();
    const speakersData = speakersSnapshot.docs
    .sort((a, b) => a.data().cardPosition - b.data().cardPosition)
    .filter(a => (a.data().show === true));
    for (let i = 0; i < speakersData.length; i++) {
      const data = speakersData[i].data();
      const id = speakersData[i].ref.id;
      const photo = this.storage.ref(data.photo).getDownloadURL();
      const companies = await this.storage.ref(data.companies[0]).getDownloadURL();
      const one: Speaker = {
        id: id,
        photo: photo,
        name: data.name,
        companies: companies,
        residence: data.residence,
        about: (data.about.length > 150 ? (data.about.substring(0, 80) + '...') : data.about ),
        facebook: data.facebook ? data.facebook : null,
        instagram: data.instagram ? data.instagram : null,
        linkedin: data.linkedin ? data.linkedin : null,
        twitter: data.twitter ? data.twitter : null,
        googleplus: data.googleplus ? data.googleplus : null,
        youtube: data.youtube ? data.youtube : null
      };
      this.speakers.push(one);
    }
  }

  close() {
    this.dialogRef.close();
  }

  click(id) {
    this.dialogRef.close(id);
  }

}
