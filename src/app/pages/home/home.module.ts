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
import { VenueModule } from 'src/app/components/venue/venue.module';
import { TopicsPanelModule } from 'src/app/components/topics/topics-panel/topics-panel.module';
import { SpeakerCardModule } from 'src/app/components/speaker-card/speaker-card.module';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatIconModule,
    MatButtonModule,
    SharedModule,
    PhotoPanelModule,
    TicketsModule,
    VenueModule,
    TopPartnerPanelModule,
    TopicsPanelModule,
    SpeakerCardModule
  ],
  declarations: [
    HomeComponent
  ],
})
export class HomeModule {}
