import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MatIconRegistry, MAT_DIALOG_DATA} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {TeamSectionComponent} from '../team/team-section.component';
import {AngularFirestore} from 'angularfire2/firestore';
import {AngularFireStorage} from 'angularfire2/storage';
import {animate, style, transition, trigger} from '@angular/animations';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-session-detail-section',
  templateUrl: './session-detail.component.html',
  styleUrls: ['./session-detail.component.scss'],
  animations: [trigger('fadeInOut', [
    transition(':enter', [   // :enter is alias to 'void => *'
      style({opacity: 0}),
      animate('200ms', style({opacity: 1}))
    ]),
    transition(':leave', [   // :leave is alias to '* => void'
      animate('500ms', style({opacity: 0}))
    ])
  ])]
})
export class SessionDetailComponent implements OnInit {

  session: any;
  speakers = [];

  constructor(private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, public dialogRef: MatDialogRef<TeamSectionComponent>,
              private firestore: AngularFirestore, private storage: AngularFireStorage, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.processSession(this.data.id);
  }

  async processSession(id) {
    const sessionSnapshot = await this.firestore.collection('sessions').doc(id).ref.get();
    this.session = sessionSnapshot.data();
    this.session.talkSubtitle = [this.session.level, this.session.language,
       this.session.hall && this.session.hall.name || '', this.session.length]
      .filter(item => item)
      .join(' / ');
    this.session.speakers.forEach(async oneSpeaker => {
      const snapshot = await oneSpeaker.get();
      this.speakers.push({
        name: snapshot.data().name,
        photo: this.storage.ref(snapshot.data().photo).getDownloadURL(),
        id: oneSpeaker.id
      });
    });
  }

  close() {
    this.dialogRef.close();
  }

  openSpeaker(id: string) {
    console.log(id);
    this.dialogRef.close(id);
  }
}
