import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import {
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSnackBarModule,
} from '@angular/material';
import { HomeRoutingModule } from './home-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { PhotoPanelModule } from 'src/app/components/photo-panel/photo-panel.module';
import { TicketsModule } from 'src/app/components/tickets/tickets.module';
import { TopPartnerPanelModule } from 'src/app/components/top-partner-panel/top-partner-panel.module';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatIconModule,
    MatButtonModule,
    SharedModule,
    PhotoPanelModule,
    TicketsModule,
    TopPartnerPanelModule
  ],
  declarations: [
    HomeComponent
  ],
})
export class HomeModule {}
