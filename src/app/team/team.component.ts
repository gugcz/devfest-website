import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { TeamMember } from '../dto/team-member';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface TeamMemberId extends TeamMember { id: string;}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  private teamCollection: AngularFirestoreCollection<TeamMember>;
  team: Observable<TeamMemberId[]>;

  constructor(private firestore: AngularFirestore) { }

  ngOnInit() {
    this.teamCollection = this.firestore.collection<TeamMember>('teamMembers', ref => ref.orderBy('order'));
    this.team = this.teamCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as TeamMember;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

}
