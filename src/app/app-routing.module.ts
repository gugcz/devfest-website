import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import { SectionsComponent } from './pages/sections/sections.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: 'section/:type',
                component: SectionsComponent,
                pathMatch: 'full'
            },
            {
                path: 'section/:type/:extra',
                component: SectionsComponent,
                pathMatch: 'full'
            },
            {
                path: 'app-invitation',
                redirectTo : '', // TODO - after created app use AppInvitationCo mponent
                pathMatch: 'full'
            },
        ]
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
