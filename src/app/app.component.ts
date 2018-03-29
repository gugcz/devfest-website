import {Component, OnInit} from '@angular/core';
import {MatIconRegistry} from '@angular/material';
import {Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {Location} from '@angular/common';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [trigger('fadeInOut', [
    transition(':enter', [   // :enter is alias to 'void => *'
      style({opacity: 0}),
      animate('500ms', style({opacity: 1}))
    ]),
    transition(':leave', [   // :leave is alias to '* => void'
      animate('500ms', style({opacity: 0}))
    ])
  ])]
})
export class AppComponent implements OnInit {

  public route: string;
  public mobile: Boolean;
  navigation = [
    {link: '', label: 'Home'},
    {link: 'team', label: 'Team'}
  ];


  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, public router: Router, public location: Location) {
    this.route = '';
    router.events.subscribe(() => {
      if (location.path() !== '') {
        this.route = location.path();
      } else {
        this.route = 'Home';
      }
    });
    iconRegistry.addSvgIcon(
      'facebook',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/facebook.svg'));
    iconRegistry.addSvgIcon(
      'twitter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/twitter.svg'));
    if (window.screen.width < 500) { // 768px portrait
      this.mobile = true;
    }
  }

  ngOnInit() {

  }
}
