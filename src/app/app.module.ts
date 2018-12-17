import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NeonLogoComponent } from './neon-logo/neon-logo.component';

@NgModule({
  declarations: [
    AppComponent,
    NeonLogoComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
