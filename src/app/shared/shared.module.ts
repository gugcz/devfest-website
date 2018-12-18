import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeonLogoComponent } from './neon-logo/neon-logo.component';
import { NeonDateComponent } from './neon-date/neon-date.component';
import { FooterComponent } from './footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { NavigationComponent } from './navigation/navigation.component';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  declarations: [
    NeonLogoComponent,
    NeonDateComponent,
    FooterComponent,
    NavigationComponent,
  ],
  exports: [
    NeonLogoComponent,
    NeonDateComponent,
    FooterComponent,
    NavigationComponent
  ]
})
export class SharedModule { }
