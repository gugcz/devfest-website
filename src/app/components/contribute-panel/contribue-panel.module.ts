import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContributePanelComponent } from './contribute-panel.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ContributePanelComponent,
  ],
  exports: [
    ContributePanelComponent
  ]
})
export class ContributePanelComponentModule { }
