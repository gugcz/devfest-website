import { Component, OnInit } from '@angular/core';

import { AngularFirestore } from 'angularfire2/firestore';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularFireStorage } from 'angularfire2/storage';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

interface Organizer {
  name: string;
  title: string;
  photo: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  googleplus: string;
}

@Component({
  selector: 'app-team-section',
  templateUrl: './team-section.component.html',
  styleUrls: ['./team-section.component.scss']
})
export class TeamSectionComponent implements OnInit {

  private organizers: Organizer[];

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
    const newList = [];
    const organizersSnapshot = await this.firestore.collection('organizers').ref.get();
    organizersSnapshot.docs.sort((a, b) => a.data().cardPosition - b.data().cardPosition).forEach((organizer) => {
      const data = organizer.data();
      const point: Organizer = {
        photo: data.photo,
        name: data.name,
        title: data.position,
        facebook: data.facebook ? data.facebook : null,
        instagram: data.instagram ? data.instagram : null,
        linkedin: data.linkedin ? data.linkedin : null,
        twitter: data.twitter ? data.twitter : null,
        googleplus: data.googleplus ? data.googleplus : null,
      };
      newList.push(point);
    });
    for (const organizer of newList) {
      organizer.photo = await this.findOrganizerPhoto(organizer.photo);
    }

    this.organizers = newList;
  }

  async findOrganizerPhoto(folder: string) {
    return await this.storage.ref(folder).getDownloadURL().toPromise();
  }

  close(){
      this.dialogRef.close();
  }

}
