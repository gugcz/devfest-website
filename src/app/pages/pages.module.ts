import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home/home.component';
import {TeamComponent} from './team/team.component';
import {ComponentsModule} from '../components/components.module';
import {InvoiceComponent} from './invoice/invoice.component';
import {MatButtonModule, MatFormFieldModule, MatInputModule, MatOptionModule, MatSelectModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule
  ],
  declarations: [
    HomeComponent,
    TeamComponent,
    InvoiceComponent
  ],
  exports: [
    HomeComponent,
    TeamComponent,
    InvoiceComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class PagesModule {
}
