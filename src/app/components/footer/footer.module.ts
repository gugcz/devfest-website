import { NgModule } from '@angular/core';
import { FooterComponent } from './footer.component';
import { FAQModule } from '../faq/faq.module';
import { FAQComponent } from '../faq/faq.component';
import { MatButtonModule } from '@angular/material';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [FooterComponent],
  imports: [FAQModule, MatButtonModule, CommonModule],
  exports: [FooterComponent],
  entryComponents: [FAQComponent],
})
export class FooterModule {}
