import {Component, OnInit} from '@angular/core';
import {Organizer} from '../../database/organizer';
import {AngularFirestore} from 'angularfire2/firestore';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {

  organizers: Organizer[];

  constructor(private fireStore: AngularFirestore) {
  }

  ngOnInit() {
    this.fireStore.collection<Organizer>('organizers').valueChanges().subscribe((data) => {
      this.organizers = data.sort((a, b) => a.cardPosition < b.cardPosition ? -1 : 1);
    });
  }

}
