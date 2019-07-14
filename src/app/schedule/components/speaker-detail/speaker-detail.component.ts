import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs';
import Speaker from 'src/app/data/speaker';
import { AngularFirestore } from '@angular/fire/firestore';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-speaker-detail',
  templateUrl: './speaker-detail.component.html',
  styleUrls: ['./speaker-detail.component.scss'],
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
export class SpeakerDetailComponent implements OnInit {

  public speaker: Observable<Speaker>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private firestore: AngularFirestore) { }

  ngOnInit() {
    console.log(this.data.ref);
    this.speaker = this.firestore.collection('speakers').doc<Speaker>(this.data.ref).valueChanges();
  }

}
