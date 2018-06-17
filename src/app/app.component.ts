import {Component, HostListener, OnInit} from '@angular/core';
import {MatIconRegistry} from '@angular/material';
import {Router, NavigationEnd} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {Location} from '@angular/common';
import {animate, style, transition, trigger} from '@angular/animations';

import {MetaChangerService} from './services/meta-changer.service';
import {routerTransition} from './global/animations/router.transition';

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
  ]), routerTransition]
})

export class AppComponent implements OnInit {

  public route: string;
  public mobile: Boolean;
  navigation = [
    {link: '', label: 'Home'},
    {link: 'team', label: 'Team'}
  ];
  lastYOffset: number;
  showMenu: boolean;
  menuType: string;


  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, public router: Router, public location: Location, private metaChanger: MetaChangerService) {
    this.route = '';
    this.showMenu = true;
    this.menuType = 'transparent';
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
    this.mobile = window.screen.width < 768 || window.innerWidth < 768;
  }

  ngOnInit() {
    this.router.events.subscribe(evt => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.pageYOffset < 5) {
      this.menuType = 'transparent';
      this.showMenu = true;
    } else if (this.lastYOffset > window.pageYOffset) {
      this.menuType = 'dark-toolbar';
      this.showMenu = true;
    } else {
      this.showMenu = false;
    }
    this.lastYOffset = window.pageYOffset;
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    this.mobile = window.screen.width < 768 || window.innerWidth < 768;
  }
}
