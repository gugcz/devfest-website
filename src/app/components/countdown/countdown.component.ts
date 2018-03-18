import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';
import * as timezone from 'moment-timezone';

@Component({
    selector: 'app-countdown',
    templateUrl: './countdown.component.html',
    styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit {
    @Input() countDownEnd: string;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;

    constructor() {
    }

    ngOnInit() {
        this.setupTime(0);
        const intervalId = setInterval(() => this.setupTime(intervalId), 1000);
    }

    setupTime(intervalId: number) {
        const now = moment();
        const duration = moment.duration(timezone.tz(this.countDownEnd, 'YYYY-MM-Do, hh:mm:ss a', 'Europe/Prague').diff(now));
        this.days = Math.floor(duration.asDays());
        this.hours = duration.hours();
        this.minutes = duration.minutes();
        this.seconds = duration.seconds();
        if (this.isCountdownFinished() && intervalId !== 0) {
            clearInterval(intervalId);
        }
    }

    isCountdownFinished() {
        return this.days === 0 && this.hours === 0 && this.minutes === 0 && this.seconds === 0;
    }
}
