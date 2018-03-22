import {Component, OnInit} from '@angular/core';
import {Organizer} from '../../database/organizer';
import {AngularFirestore} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {

  organizers$: Observable<Organizer[]>;

  constructor(private fireStore: AngularFirestore) {
  }

  ngOnInit() {
   this.organizers$ = this.fireStore.collection<Organizer>('organizers', ref => ref.orderBy('cardPosition')).valueChanges();
  }

}
