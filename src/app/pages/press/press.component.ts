import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import PressLink from '../../data/press-link';
import {AngularFirestore} from '@angular/fire/firestore';
import {TeamMember} from '../../data/team-member';
import {map} from 'rxjs/operators';
import config from 'src/config';

@Component({
  selector: 'app-press',
  templateUrl: './press.component.html',
  styleUrls: ['./press.component.scss']
})
export class PressComponent implements OnInit {

  releases: Observable<PressLink[]>;
  wrote: Observable<PressLink[]>;
  team: Observable<TeamMember[]>;
  publicGraphicLink = config.publicGraphicLink;

  constructor(private firestore: AngularFirestore) {
  }

  ngOnInit() {
    this.releases = this.firestore.collection<PressLink>('pressLinks', ref => ref.where('intern', '==', true)).valueChanges();
    this.wrote = this.firestore.collection<PressLink>('pressLinks', ref => ref.where('intern', '==', false)).valueChanges();
    const teamCollection = this.firestore.collection<TeamMember>('teamMembers', ref => ref.where('position', '==', 'PR').orderBy('order'));
    this.team = teamCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as TeamMember;
        const id = a.payload.doc.id;
        return {id, ...data};
      }))
    );
  }

}
