import { NgModule } from '@angular/core';
import { ScheduleDatesComponent } from './schedule-dates.component';
import { MatTabsModule, MatButtonModule, MatToolbarModule } from '@angular/material';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [ScheduleDatesComponent],
  exports: [ScheduleDatesComponent],
  imports: [
      MatTabsModule,
      CommonModule,
      MatButtonModule,
      MatToolbarModule,
      MatTabsModule,
  ]
})
export class ScheduleDatesModule {}
