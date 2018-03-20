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
  loading: Boolean;

  constructor(private fireStore: AngularFirestore) {
  }

  ngOnInit() {
    this.loading = true;
    this.fireStore.collection<Organizer>('organizers').valueChanges().subscribe((data) => {
      this.loading = false;
      this.organizers = data.sort((a, b) => a.cardPosition < b.cardPosition ? -1 : 1);
    });
  }

}
