import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  constructor(private afFunctions: AngularFireFunctions) {
    const callable = afFunctions.httpsCallable('getTickets');
    callable({}).subscribe(data => {
      console.log(data);
    });
   }

  ngOnInit() {
  }

}
