import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: './pages/home/home.module#HomeModule'
  },
  {
    path: 'team',
    loadChildren: './pages/team/team.module#TeamModule'
  },
  {
    path: 'partners',
    loadChildren: './pages/partners/partners.module#PartnersModule'
  },
  {
    path: 'press',
    loadChildren: './pages/press/press.module#PressModule'
  },
  {
    path: 'schedule',
    loadChildren: './pages/schedule/schedule.module#ScheduleModule'
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      preloadingStrategy: PreloadAllModules,
      anchorScrolling: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
