import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import { SpeakersComponent } from './pages/speakers/speakers.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';

const routes: Routes = [
  {
    path: 'speakers',
    component: SpeakersComponent
  },
  {
    path: 'overview',
    component: ScheduleComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule {
}
