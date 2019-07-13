import {Component, OnInit} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import Partner from '../data/partner';
import {SocialIconsService} from '../services/social-icons.service';
import {animate, style, transition, trigger} from '@angular/animations';
import config from 'src/config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('600ms', style({opacity: 1}))
      ]),
      transition(':leave', [
        animate('300ms', style({opacity: 0}))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {

  hideTickets = config.hideTickets;
  mailFormLink = config.mailFormLink;
  twitterLink = config.twitter;
  facebookLink = config.facebook;
  instagramLink = config.instagram;
  partners: Observable<Partner[]>;
  private partnersCollection: AngularFirestoreCollection<Partner>;

  constructor(private afStore: AngularFirestore, private socialsSer: SocialIconsService) {
  }

  ngOnInit() {
    this.partnersCollection = this.afStore.collection<Partner>('partners', ref => ref.where('top', '==', true).orderBy('order'));
    this.partners = this.partnersCollection.valueChanges();
  }

}
