import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { TeamSectionComponent } from './team/team-section.component';
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
              width: '70vw',
              maxWidth: '1000px',
              height: '90vh'
            });

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
