import { Component, OnInit } from '@angular/core';

import { AngularFirestore } from 'angularfire2/firestore';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularFireStorage } from 'angularfire2/storage';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { animate, style, transition, trigger } from '@angular/animations';
import { Observable } from 'rxjs';
interface Organizer {
  name: string;
  title: string;
  photo: Observable<string>;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  googleplus: string;
}

@Component({
  selector: 'app-team-section',
  templateUrl: './team-section.component.html',
  styleUrls: ['./team-section.component.scss'],
  animations: [trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
          style({ opacity: 0 }),
          animate('500ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
          animate('500ms', style({ opacity: 0 }))
      ])
  ])]
})
export class TeamSectionComponent implements OnInit {

  organizers: Organizer[] = [];

  constructor(private firestore: AngularFirestore, private iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer, private storage: AngularFireStorage,
    public dialogRef: MatDialogRef<TeamSectionComponent>) {
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
    this.processOrganizers();
  }

  async processOrganizers() {
    const organizersSnapshot = await this.firestore.collection('organizers').ref.get();
    const organizerData = organizersSnapshot.docs.sort((a, b) => a.data().cardPosition - b.data().cardPosition);
    for (let i = 0; i < organizerData.length; i++) {
      const data = organizerData[i].data();
      const photo = this.storage.ref(data.photo).getDownloadURL();
      const point: Organizer = {
        photo: photo,
        name: data.name,
        title: data.position,
        facebook: data.facebook ? data.facebook : null,
        instagram: data.instagram ? data.instagram : null,
        linkedin: data.linkedin ? data.linkedin : null,
        twitter: data.twitter ? data.twitter : null,
        googleplus: data.googleplus ? data.googleplus : null,
      };
      this.organizers.push(point);
    }
  }

  close() {
      this.dialogRef.close();
  }

}
