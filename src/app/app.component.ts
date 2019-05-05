import {Component} from '@angular/core';
import {navLinks} from './router-links';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  navLinks = navLinks;
}
