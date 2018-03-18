import { Component, OnInit } from '@angular/core';
import {MatIconRegistry} from "@angular/material";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'movie',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/movie.svg'));
  }

  ngOnInit() {
  }

  mailTo() {
    window.location.href = 'mailto:devfest@gug.cz,info@martinkokes.cz';
  }

}
