import {Component} from '@angular/core';
import navLinks from './router-links';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  navLinks = navLinks;
  currentRoute: string;

  constructor(private router: Router){
    this.router.events.subscribe(value => {
      if (value instanceof NavigationStart) {
        this.currentRoute = value.url;
      }
    });
  }
}
