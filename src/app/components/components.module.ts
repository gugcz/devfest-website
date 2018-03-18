import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../global/shared.module';
import {CountdownComponent} from './countdown/countdown.component';
import {TopToolbarComponent} from './top-toolbar/top-toolbar.component';
import {AppRoutingModule} from '../app-routing.module';
import {EmailNotifierComponent} from './email-notifier/email-notifier.component';
import {FooterComponent} from "./footer/footer.component";
import {SocialNetworksComponent} from "./social-networks/social-networks.component";

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        AppRoutingModule
    ],
    declarations: [
        CountdownComponent,
        TopToolbarComponent,
        EmailNotifierComponent,
        FooterComponent,
        SocialNetworksComponent
    ],
    exports: [
        CountdownComponent,
        TopToolbarComponent,
        EmailNotifierComponent,
        FooterComponent,
        SocialNetworksComponent
    ]
})
export class ComponentsModule {
}
