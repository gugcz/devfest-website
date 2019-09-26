import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: './home/home.module#HomeModule'
  },
  {
    path: 'team',
    loadChildren: './team/team.module#TeamModule'
  },
  {
    path: 'partners',
    loadChildren: './partners/partners.module#PartnersModule'
  },
  {
    path: 'press',
    loadChildren: './press/press.module#PressModule'
  },
  {
    path: 'schedule',
    loadChildren: './schedule/schedule.module#ScheduleModule'
  },
  {
    path: 'info',
    loadChildren: './info/info.module#InfoModule'
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
