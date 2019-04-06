import { Component, OnInit, AfterViewInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { fromEvent } from 'rxjs';
import { throttleTime, map, pairwise, distinctUntilChanged, share, filter } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router, Event, NavigationEnd } from '@angular/router';

export enum Direction {
  Up = 'Up',
  Down = 'Down'
}

export enum VisibilityState {
  Visible = 'visible',
  Hidden = 'hidden'
}

export enum TransparentState {
  Transparent = 'transparent',
  Full = 'full'
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
  animations: [
    trigger('toggle', [
      state(
        VisibilityState.Hidden,
        style({ opacity: 0, transform: 'translateY(-100%)' })
      ),
      state(
        VisibilityState.Visible,
        style({ opacity: 1, transform: 'translateY(0)' })
      ),
      transition('* => *', animate('200ms ease-in'))
    ]),
    trigger('transparent', [
      state(
        TransparentState.Transparent,
        style({ backgroundColor: 'rgba(18, 42, 66, .98)' })
      ),
      state(
        TransparentState.Full,
        style({ backgroundColor: 'rgba(18, 42, 66,  0.2)' })
      ),
      transition('* => *', animate('200ms ease-in'))
    ])
  ]
})
export class NavigationComponent implements AfterViewInit {
  private isVisible = true;
  private isTop = true;
  public isHome = true;

  @Input() isMobile = false;
  @Output() homeClicked = new EventEmitter<void>();

  navLinks = [
    {
      path: 'home',
      label: 'Home'
    },
    {
      path: 'team',
      label: 'Team'
    },
    {
      path: 'partners',
      label: 'Partners'
    }
  ];

  @HostBinding('@toggle')
  get toggle(): VisibilityState {
    return this.isVisible ? VisibilityState.Visible : VisibilityState.Hidden;
  }

  get transparent(): TransparentState {
    return this.isTop ? TransparentState.Full : TransparentState.Transparent;
  }

  constructor(private router: Router) { }

  ngAfterViewInit() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === "/" || event.url === "/home") {
          this.isHome = true;
        } else {
          this.isHome = false;
        }
      }
    })

    const scroll$ = fromEvent(window, 'scroll').pipe(
      map(() => window.pageYOffset),
      pairwise(),
      map(([y1, y2]): Direction => (y2 < y1 ? Direction.Up : Direction.Down)),
      distinctUntilChanged(),
      share(),
    );

    const scrollOffSet$ = fromEvent(window, 'scroll').pipe(
      map(() => window.pageYOffset)
    );

    const scrollUp$ = scroll$.pipe(
      filter(direction => direction === Direction.Up)
    );

    const scrollDown$ = scroll$.pipe(
      filter(direction => direction === Direction.Down)
    );

    const scrollTop$ = scrollOffSet$.pipe(
      filter(y => y === 0)
    );

    scrollTop$.subscribe(() => (this.isTop = true));
    scrollUp$.subscribe(() => (this.isVisible = true));
    scrollDown$.subscribe(() => { this.isVisible = false; this.isTop = false });
  }
}
