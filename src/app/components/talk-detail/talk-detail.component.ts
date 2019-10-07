import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { trigger, transition, style, animate } from '@angular/animations';
import { SocialIconsService } from 'src/app/services/social-icons.service';
import Talk from 'src/app/data/talk';

@Component({
  selector: 'app-talk-detail',
  templateUrl: './talk-detail.component.html',
  styleUrls: ['./talk-detail.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TalkDetailComponent implements OnInit {

  public talk: Observable<Talk>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private firestore: AngularFirestore, private socials: SocialIconsService) { }

  ngOnInit() {
    this.talk = this.firestore.doc<Talk>(this.data.ref.path).valueChanges();
  }

}
