import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {DownloadAppComponent} from './downloadaap.component';

const routes: Routes = [
  {
    path: '',
    component: DownloadAppComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DownloadAppRoutingModule {
}
