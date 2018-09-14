import {Component, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material';
import {TeamSectionComponent} from './team/team-section.component';
import {MediaSectionComponent} from './media/media-section.component';
import {TicketsSectionComponent} from './tickets/tickets-section.component';
import {SpeakersSectionComponent} from './speakers/speakers-section.component';

@Component({
  templateUrl: './sections.component.html',
  selector: 'app-sections',
})
export class SectionsComponent implements OnDestroy, AfterViewInit {


  private sub: any;

  constructor(private route: ActivatedRoute, private matDialog: MatDialog, private router: Router) {

  }

  ngAfterViewInit() {
    setTimeout(() => {
      let dialogRef;
      this.sub = this.route.params.subscribe(params => {
        const type = params['type'];
        switch (type) {
          case 'team': {
            dialogRef = this.matDialog.open(TeamSectionComponent, {
              width: '100vw',
              height: '100vh',
              maxWidth: '',
            });
            break;
          }
          case 'media': {
            dialogRef = this.matDialog.open(MediaSectionComponent, {
              width: '100vw',
              height: '100vh',
              maxWidth: '',
            });
            break;
          }
          case 'tickets': {
            dialogRef = this.matDialog.open(TicketsSectionComponent, {
              width: '100vw',
              height: '100vh',
              maxWidth: '',
            });
            break;
          }
          case 'speakers': {
            dialogRef = this.matDialog.open(SpeakersSectionComponent, {
              width: '100vw',
              height: '100vh',
              maxWidth: '',
            });
            break;
          }
        }
      });
      if (dialogRef != null) {
        dialogRef.afterClosed().subscribe(() => {
          this.router.navigateByUrl('/');
        });
      }

    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
