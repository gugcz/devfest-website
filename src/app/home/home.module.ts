import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';  
import { TicketsComponent } from './tickets/tickets.component';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFirestoreModule } from '@angular/fire/firestore';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AngularFireFunctionsModule,
    AngularFirestoreModule
  ],
  declarations: [
    HomeComponent,
    TicketsComponent,
  ]
})
export class HomeModule { }
