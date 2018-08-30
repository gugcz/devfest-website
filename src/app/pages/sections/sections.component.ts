import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { TeamSectionComponent } from './team/team-section.component';
@Component({
  selector: 'app-sections',
  templateUrl: './../home/home.component.html',
  styleUrls: ['./../home/home.component.scss']
})
export class SectionsComponent implements OnDestroy, AfterViewInit {


  private sub: any;

  constructor(private route: ActivatedRoute, private matDialog: MatDialog) {

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sub = this.route.params.subscribe(params => {
        const type = params['type'];
        switch (type) {
          case 'team': {
            this.matDialog.open(TeamSectionComponent, {
              width: '70vw',
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
