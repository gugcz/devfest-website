import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home/home.component';
import {TeamComponent} from './team/team.component';
import {ComponentsModule} from '../components/components.module';
import {MatButtonModule, MatFormFieldModule, MatInputModule, MatOptionModule, MatSelectModule} from '@angular/material';
import {InvoiceComponent} from '../components/invoice/invoice.component';

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
    ],
    exports: [
        HomeComponent,
        TeamComponent,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule
    ],
    entryComponents: [
        InvoiceComponent
    ]
})
export class PagesModule {
}
