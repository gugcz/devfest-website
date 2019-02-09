import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Partner } from '../dto/partner';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PartnerId extends Partner { id: string }

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private partnersCollection: AngularFirestoreCollection;
  partners: Observable<PartnerId[]>

  constructor(private afStore: AngularFirestore) { }

  ngOnInit() {
    this.partnersCollection = this.afStore.collection<Partner>('partners', ref => ref.where('top', '==', true));
    this.partners = this.partnersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Partner;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

}
