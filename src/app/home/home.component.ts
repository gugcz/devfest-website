import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Partner } from '../data/partner';
import { SocialIconsService } from '../services/social-icons.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private partnersCollection: AngularFirestoreCollection<Partner>;
  partners: Observable<Partner[]>;
  showTickets = environment.tickets;

  constructor(private afStore: AngularFirestore, private socialsSer: SocialIconsService) { }

  ngOnInit() {
    this.partnersCollection = this.afStore.collection<Partner>('partners', ref => ref.where('top', '==', true).orderBy('order'));
    this.partners = this.partnersCollection.valueChanges();
  }

}
