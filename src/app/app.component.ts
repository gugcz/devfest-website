import { Component } from '@angular/core';
import { animate, style, transition, trigger, query, sequence, stagger } from '@angular/animations';

export const ANIMATE_ON_ROUTE_ENTER = 'route-enter-staggered';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [trigger('fadeInOut', [
        transition(':enter', [
            style({ opacity: 0 }),
            animate('200ms', style({ opacity: 1 }))
        ]),
        transition(':leave', [
            animate('200ms', style({ opacity: 0 }))
        ])
    ]), trigger('routerTransition', [
        transition('* <=> *', [
            query(':enter > *', style({ opacity: 0, position: 'fixed' }), {
                optional: true
            }),
            query(':enter .' + ANIMATE_ON_ROUTE_ENTER, style({ opacity: 0 }), {
                optional: true
            }),
            sequence([
                query(
                    ':leave > *',
                    [
                        style({ transform: 'translateY(0%)', opacity: 1 }),
                        animate(
                            '0.2s ease-in-out',
                            style({ transform: 'translateY(-3%)', opacity: 0 })
                        ),
                        style({ position: 'fixed' })
                    ],
                    { optional: true }
                ),
                query(
                    ':enter > *',
                    [
                        style({
                            transform: 'translateY(-3%)',
                            opacity: 0,
                            position: 'static'
                        }),
                        animate(
                            '0.5s ease-in-out',
                            style({ transform: 'translateY(0%)', opacity: 1 })
                        )
                    ],
                    { optional: true }
                )
            ]),
            query(
                ':enter .' + ANIMATE_ON_ROUTE_ENTER,
                stagger(100, [
                    style({ transform: 'translateY(15%)', opacity: 0 }),
                    animate(
                        '0.5s ease-in-out',
                        style({ transform: 'translateY(0%)', opacity: 1 })
                    )
                ]),
                { optional: true }
            )
        ])
    ])]
})

export class AppComponent {
}
