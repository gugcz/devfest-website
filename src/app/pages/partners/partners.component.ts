import {Component, OnInit} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import Partner from '../../data/partner';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit {

  partners: Observable<Partner[]>;
  private partnersCollection: AngularFirestoreCollection<Partner>;

  constructor(private afStore: AngularFirestore) {
  }

  ngOnInit() {
    this.partnersCollection = this.afStore.collection<Partner>('partners', ref => ref.where('self', '==', false).orderBy('order'));
    this.partners = this.partnersCollection.valueChanges();
  }

}
