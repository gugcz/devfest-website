import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Speaker from 'src/app/data/speaker';

@Component({
  selector: 'app-speakers',
  templateUrl: './speakers.component.html',
  styleUrls: ['./speakers.component.scss']
})
export class SpeakersComponent implements OnInit {

  speakers: Observable<Speaker[]>;

  constructor(private firestore: AngularFirestore) { }

  ngOnInit() {
    this.speakers = this.firestore.collection<Speaker>('speakers').valueChanges();
  }

}
