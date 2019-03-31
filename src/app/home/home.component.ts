import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Partner } from '../dto/partner';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private partnersCollection: AngularFirestoreCollection<Partner>;
  partners: Observable<Partner[]>;

  constructor(private afStore: AngularFirestore) { }

  ngOnInit() {
    this.partnersCollection = this.afStore.collection<Partner>('partners', ref => ref.where('top', '==', true).orderBy('order'));
    this.partners = this.partnersCollection.valueChanges();
  }

}
