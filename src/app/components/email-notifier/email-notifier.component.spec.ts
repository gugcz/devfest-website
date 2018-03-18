import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EmailNotifierComponent} from './email-notifier.component';

describe('EmailNotifierComponent', () => {
    let component: EmailNotifierComponent;
    let fixture: ComponentFixture<EmailNotifierComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EmailNotifierComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EmailNotifierComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
