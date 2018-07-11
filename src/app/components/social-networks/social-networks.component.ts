import {Component, OnInit} from '@angular/core';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-social-networks',
  templateUrl: './social-networks.component.html',
  styleUrls: ['./social-networks.component.scss']
})
export class SocialNetworksComponent implements OnInit {

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'facebook',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/socials/facebook.svg'));
    iconRegistry.addSvgIcon(
      'twitter',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/socials/twitter.svg'));
    iconRegistry.addSvgIcon(
      'instagram',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/socials/instagram.svg'));
  }

  ngOnInit() {
  }

}
