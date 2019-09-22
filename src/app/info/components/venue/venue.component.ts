import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Info from '../../../data/info';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  styleUrls: ['./venue.component.scss']
})
export class VenueComponent implements OnInit {
  public infoVenue: Observable<Info[]>;

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.infoVenue = this.firestore
      .collection<Info>('info', ref => ref.where('tag', '==', 'venue').orderBy('position'))
      .valueChanges();
  }
}
