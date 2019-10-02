import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DeviceDetectorService } from 'ngx-device-detector';
import config from 'src/config';
import { FAQComponent } from '../faq/faq.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  private isMobile: boolean;
  public email = config.email;
  public partnersEmail = config.partnersEmail;

  constructor(
    private matDialog: MatDialog,
    private deviceService: DeviceDetectorService
  ) {
    this.isMobile = this.deviceService.isMobile();
  }

  ngOnInit() {}

  openFAQ() {
    this.matDialog.open(FAQComponent, {
      width: this.isMobile ? '370px' : '700px',
    });
  }
}
