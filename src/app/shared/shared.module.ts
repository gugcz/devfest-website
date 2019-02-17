import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeonLogoComponent } from './neon-logo/neon-logo.component';
import { NeonDateComponent } from './neon-date/neon-date.component';
import { FooterComponent } from './footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavigationComponent } from './navigation/navigation.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { PartnerPanelComponent } from './partner-panel/partner-panel.component';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { PartnerLogoComponent } from './partner-logo/partner-logo.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ContributePanelComponent } from './contribute-panel/contribute-panel.component';
import { SocialIconsService } from './social-icons.service';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    RouterModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    MatTabsModule
  ],
  declarations: [
    NeonLogoComponent,
    NeonDateComponent,
    FooterComponent,
    NavigationComponent,
    PartnerPanelComponent,
    PartnerLogoComponent,
    ContributePanelComponent,
  ],
  exports: [
    NeonLogoComponent,
    NeonDateComponent,
    FooterComponent,
    NavigationComponent,
    PartnerPanelComponent,
    ContributePanelComponent
  ],
  providers: [
    SocialIconsService
  ]
})
export class SharedModule { }
