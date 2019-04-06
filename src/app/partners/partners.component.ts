import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Partner } from '../data/partner';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit {

  private partnersCollection: AngularFirestoreCollection<Partner>;
  partners: Observable<Partner[]>;

  constructor(private afStore: AngularFirestore) { }

  ngOnInit() {
    this.partnersCollection = this.afStore.collection<Partner>('partners', ref => ref.where('top', '==', false).orderBy('order'));
    this.partners = this.partnersCollection.valueChanges();
  }

}
