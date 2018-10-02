import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatIconRegistry, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { TeamSectionComponent } from '../team/team-section.component';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { animate, style, transition, trigger } from '@angular/animations';

interface Speaker {
  name: string;
  companies: string[];
  intro: string;
  photo: string;
  residence: string;
  facebook: string;
  instagram: string;
  job: string;
  linkedin: string;
  twitter: string;
  sessions: Session[];
  googleplus: string;
}

interface Session {
  name: string;
  description: string;
}

@Component({
  selector: 'app-speaker-detail-section',
  templateUrl: './speaker-detail.component.html',
  styleUrls: ['./speaker-detail.component.scss'],
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
export class SpeakerDetailSectionComponent implements OnInit {

  speaker: Speaker;

  constructor(private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, public dialogRef: MatDialogRef<TeamSectionComponent>,
    private firestore: AngularFirestore, private storage: AngularFireStorage, @Inject(MAT_DIALOG_DATA) public data: any) {
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
    this.processSpeaker(this.data.id);
  }

  async processSpeaker(id) {
    const speakerSnapshot = await this.firestore.collection('speakers').doc(id).ref.get();
    const data = speakerSnapshot.data();
    const photo = await this.findPhoto(data.photo);
    const companies = [];
    for (let y = 0; y < data.companies.length; y++) {
        const logo = await this.findPhoto(data.companies[y]);
        companies.push(logo);
    }
    const one: Speaker = {
      photo: photo,
      name: data.name,
      companies: companies,
      residence: data.residence,
      job: data.job,
      intro: data.about,
      sessions: data.sessions ? data.sessions : [],
      facebook: data.facebook ? data.facebook : null,
      instagram: data.instagram ? data.instagram : null,
      linkedin: data.linkedin ? data.linkedin : null,
      twitter: data.twitter ? data.twitter : null,
      googleplus: data.googleplus ? data.googleplus : null,
    };
    this.speaker = one;
  }

  close() {
    this.dialogRef.close();
  }

  async findPhoto(folder: string) {
    return await this.storage.ref(folder).getDownloadURL().toPromise();
  }
}
