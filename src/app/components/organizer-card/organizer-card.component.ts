import {Component, Input, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {Organizer} from '../../database/organizer';
import {animate, style, transition, trigger} from '@angular/animations';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-organizer-card',
  templateUrl: './organizer-card.component.html',
  styleUrls: ['./organizer-card.component.scss'],
  animations: [
    trigger(
      'slideInRight',
      [
        transition(
          ':enter', [
            style({transform: 'translateY(100%)', opacity: 0}),
            animate('500ms', style({transform: 'translateY(0)', opacity: 1}))
          ]
        ),
        transition(
          ':leave', [
            style({transform: 'translateY(0)', 'opacity': 1}),
            animate('500ms', style({transform: 'translateY(-100%)', opacity: 0}))
          ]
        )
      ])
  ]
})
export class OrganizerCardComponent implements OnInit {

  @Input() id: string;
  organizer: Organizer;

  constructor(private fireStore: AngularFirestore, private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'facebook',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/facebook.svg'));
    iconRegistry.addSvgIcon(
      'twitter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/twitter.svg'));
    iconRegistry.addSvgIcon(
      'instagram',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/instagram.svg'));
  }

  ngOnInit() {
    this.fireStore.collection<Organizer>('organizers').doc<Organizer>(this.id).valueChanges().subscribe((data) => {
      this.organizer = data;
    });
  }

}
