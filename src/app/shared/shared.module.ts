import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeonLogoComponent } from './neon-logo/neon-logo.component';
import { NeonDateComponent } from './neon-date/neon-date.component';
import { FooterComponent } from './footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  declarations: [
    NeonLogoComponent,
    NeonDateComponent,
    FooterComponent,
  ],
  exports: [
    NeonLogoComponent,
    NeonDateComponent,
    FooterComponent
  ]
})
export class SharedModule { }
