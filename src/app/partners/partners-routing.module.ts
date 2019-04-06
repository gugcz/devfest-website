import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PartnersComponent } from './partners.component';

const routes: Routes = [
  {
    path: '',
    component: PartnersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartnersRoutingModule { }
