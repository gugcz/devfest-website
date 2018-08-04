import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'app-media',
    templateUrl: './media.component.html',
    styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit {

    mediaInfo$: Observable<any>;

    constructor() {
    }

    ngOnInit() {
    }

}
