import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Partner from '../../data/partner';
import { SocialIconsService } from '../../services/social-icons.service';
import { animate, style, transition, trigger } from '@angular/animations';
import config from 'src/config';
import Speaker from 'src/app/data/speaker';

@Component({
  selector: 'app-downloadapp',
  templateUrl: './downloadapp.component.html',
  styleUrls: ['./downloadapp.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class DownloadAppComponent implements OnInit {
  hideTickets = config.hideTickets;
  mailFormLink = config.mailFormLink;
  twitterLink = config.twitter;
  facebookLink = config.facebook;
  instagramLink = config.instagram;
  cfpFormLink = config.cfpFormLink;
  partners: Observable<Partner[]>;
  speakers: Observable<Speaker[]>;

  private partnersCollection: AngularFirestoreCollection<Partner>;

  constructor(
    private afStore: AngularFirestore,
    private socialsSer: SocialIconsService
  ) {}

  ngOnInit() {
    window.location.href = 'https://devfest-cdh.web.app/';
  }
}
