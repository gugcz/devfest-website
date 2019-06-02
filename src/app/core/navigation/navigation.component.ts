import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import {Event, NavigationEnd, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';
import {navLinks} from '../../router-links';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {filter, map} from 'rxjs/operators';
import {fromEvent} from 'rxjs';

export enum TransparentState {
  Transparent = 'transparent',
  Full = 'full'
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  animations: [
    trigger('transparent', [
      state(
        TransparentState.Full,
        style({backgroundColor: 'rgba(18, 42, 66, 1)'})
      ),
      state(
        TransparentState.Transparent,
        style({backgroundColor: 'rgba(18, 42, 66,  0.6)'})
      ),
      transition('* => *', animate('150ms ease-in'))
    ])
  ]
})
export class NavigationComponent implements AfterViewInit {
  public isHome = true;
  public isMobile = false;
  navLinks = navLinks;

  @Output() homeClicked = new EventEmitter<void>();
  private isTop = true;

  constructor(private router: Router, private deviceService: DeviceDetectorService) {
    this.isMobile = this.deviceService.isMobile();
  }

  get transparent(): TransparentState {
    return this.isTop ? TransparentState.Transparent : TransparentState.Full;
  }

  ngAfterViewInit() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.isHome = event.url === '/' || event.url === '/home';
      }
    });

    const scrollOffSet$ = fromEvent(window, 'scroll').pipe(
      map(() => window.pageYOffset)
    );


    const scrollTop$ = scrollOffSet$.pipe(
      filter(y => y === 0)
    );

    const scrollElse$ = scrollOffSet$.pipe(
      filter(y => y !== 0)
    );

    scrollTop$.subscribe(() => (this.isTop = true));
    scrollElse$.subscribe(() => (this.isTop = false));

  }
}
