import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {TeamComponent} from './pages/team/team.component';
import {HomeComponent} from './pages/home/home.component';
import {MediaComponent} from './pages/media/media.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
    },
    {
        path: 'team',
        component: TeamComponent,
        pathMatch: 'full',
    },
    {
        path: 'media',
        component: MediaComponent,
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
