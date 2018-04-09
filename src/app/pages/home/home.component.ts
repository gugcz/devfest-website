import {Component, OnInit} from '@angular/core';
import {ANIMATE_ON_ROUTE_ENTER} from '../../global/animations/router.transition';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  animateOnRouteEnter = ANIMATE_ON_ROUTE_ENTER;

  constructor() {
  }

  ngOnInit() {
  }

}
