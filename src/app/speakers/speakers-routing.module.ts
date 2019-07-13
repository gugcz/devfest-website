import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {SpeakersComponent} from './speakers.component';

const routes: Routes = [
  {
    path: '',
    component: SpeakersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpeakersRoutingModule {
}
