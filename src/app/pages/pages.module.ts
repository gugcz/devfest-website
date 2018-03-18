import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home/home.component';
import {TeamComponent} from './team/team.component';
import {ComponentsModule} from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule
  ],
  declarations: [
    HomeComponent,
    TeamComponent
  ],
  exports: [
    HomeComponent,
    TeamComponent
  ]
})
export class PagesModule {
}
