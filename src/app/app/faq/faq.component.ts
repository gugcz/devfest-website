import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  public questions: Observable<FAQ[]>;

  constructor(private angularfirestore: AngularFirestore) {
  }

  ngOnInit() {
    this.questions = this.angularfirestore.collection<FAQ>('faq').valueChanges();
  }

}
