import {Component, OnInit} from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'app-media-contact',
    templateUrl: './media-contact.component.html',
    styleUrls: ['./media-contact.component.scss']
})
export class MediaContactComponent implements OnInit {

    constructor(private iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer) {
    }

    ngOnInit() {
    }

}
