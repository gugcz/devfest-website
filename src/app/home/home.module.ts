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
import { MatDialogModule } from '@angular/material/dialog';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { TicketAdditionalInfoComponent } from './ticket-additional-info/ticket-additional-info.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PhotoSectionComponent } from './photo-section/photo-section.component';
import {SlideshowModule} from 'ng-simple-slideshow';
import { SocialIconsService } from '../shared/social-icons.service';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AngularFireFunctionsModule,
    AngularFirestoreModule,
    MatDialogModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule,
    SlideshowModule,
    MatIconModule
  ],
  declarations: [
    HomeComponent,
    TicketsComponent,
    InvoiceFormComponent,
    TicketAdditionalInfoComponent,
    PhotoSectionComponent
  ],
  entryComponents: [
    InvoiceFormComponent,
    TicketAdditionalInfoComponent
  ],
  providers: [
    SocialIconsService
  ]
})
export class HomeModule { }
