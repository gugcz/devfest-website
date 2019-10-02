import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import config from 'src/config';
import FAQ from 'src/app/data/faq';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FAQComponent implements OnInit {

  public questions: Observable<FAQ[]>;
  public facebookEvent = config.facebookEvent;
  public meetupEvent = config.meetupEvent;
  public email = config.email;

  constructor(private angularfirestore: AngularFirestore) {
  }

  ngOnInit() {
    this.questions = this.angularfirestore.collection<FAQ>('faq').valueChanges();
  }

}
