import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';

import { MatButtonModule } from '@angular/material/button';
import { PremiumPartnersComponent } from './premium-partners/premium-partners.component';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    MatButtonModule
  ],
  declarations: [
    HomeComponent,
    PremiumPartnersComponent,
  ]
})
export class HomeModule { }
