import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { TeamSectionComponent } from './team/team-section.component';
import { MediaSectionComponent } from './media/media-section.component';
@Component({
  selector: 'app-sections',
  templateUrl: './../home/home.component.html',
  styleUrls: ['./../home/home.component.scss']
})
export class SectionsComponent implements OnDestroy, AfterViewInit {


  private sub: any;

  constructor(private route: ActivatedRoute, private matDialog: MatDialog, private router: Router) {

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sub = this.route.params.subscribe(params => {
        const type = params['type'];
        switch (type) {
          case 'team': {
            this.matDialog.open(TeamSectionComponent, {
              width: '70vw',
              maxWidth: '1000px',
              height: '90vh'
            });
            break;
          }
          case 'media': {
            this.matDialog.open(MediaSectionComponent, {
              width: '70vw',
              maxWidth: '1000px',
              height: '90vh'
            });
          }
        }
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
