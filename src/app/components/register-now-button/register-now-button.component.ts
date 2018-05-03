import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register-now-button',
  templateUrl: './register-now-button.component.html',
  styleUrls: ['./register-now-button.component.scss']
})
export class RegisterNowButtonComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  slideToTickets() {
    console.log(document.getElementById('js-tickets').offsetTop);
    window.scrollTo({ left: 0, top: document.getElementById('js-tickets').offsetTop, behavior: 'smooth' });
  }

}
