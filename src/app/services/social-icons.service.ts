import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SocialIconsService {

  constructor(private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'twitter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/twitter.svg')
    );
    iconRegistry.addSvgIcon(
      'facebook',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/facebook.svg')
    );
    iconRegistry.addSvgIcon(
      'linkedin',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/linkedin.svg')
    );
    iconRegistry.addSvgIcon(
      'instagram',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/instagram.svg')
    );
    iconRegistry.addSvgIcon(
      'blogger',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/blogger.svg')
    );
    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/github.svg')
    );
    iconRegistry.addSvgIcon(
      'pinterest',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/pinterest.svg')
    );
    iconRegistry.addSvgIcon(
      'reddit',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/reddit.svg')
    );
   }
}