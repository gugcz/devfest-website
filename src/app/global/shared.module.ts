import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule, MatIconModule, MatInputModule, MatToolbarModule} from '@angular/material';
import {RouterModule} from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
    ],
    exports: [
        CommonModule,
        RouterModule,
        MatToolbarModule,
        MatButtonModule,
        RouterModule,
        MatIconModule,
        MatInputModule
    ],
    declarations: []
})
export class SharedModule {
}
