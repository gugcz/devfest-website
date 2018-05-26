import {Component, OnInit} from '@angular/core';
import {Ticket} from '../../database/ticket';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {

  tickets$: Observable<Ticket[]>;

  constructor(private http: HttpClient, private fireStore: AngularFirestore) {
  }

  ngOnInit() {
    const headers = {
      headers: new HttpHeaders({
        'Authorization': 'Token token=6z4GwhHNVrcudVCCJnTD',
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/vnd.api+json'
      })
    };
    this.http.get('https://api.tito.io/v2/vendelinkuv-ucet/vendelinkuv-event/releases', headers)
      .toPromise()
      .then(console.log);
  }

}
