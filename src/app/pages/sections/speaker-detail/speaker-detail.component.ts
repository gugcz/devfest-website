import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {TeamSectionComponent} from '../team/team-section.component';

@Component({
  selector: 'app-speaker-detail-section',
  templateUrl: './speaker-detail.component.html',
  styleUrls: ['./speaker-detail.component.scss']
})
export class SpeakerDetailSectionComponent implements OnInit {

  constructor(private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, public dialogRef: MatDialogRef<TeamSectionComponent>) {
    iconRegistry.addSvgIcon(
      'facebook',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/facebook.svg'));
    iconRegistry.addSvgIcon(
      'twitter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/twitter.svg'));
    iconRegistry.addSvgIcon(
      'instagram',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/instagram.svg'));
    iconRegistry.addSvgIcon(
      'googleplus',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/google.svg'));
    iconRegistry.addSvgIcon(
      'linkedin',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/linkedin.svg'));
    iconRegistry.addSvgIcon(
      'youtube',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/team-socials/youtube.svg'));
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

}
