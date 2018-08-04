import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MediaGraphicsComponent} from './media-graphics.component';

describe('MediaGraphicsComponent', () => {
    let component: MediaGraphicsComponent;
    let fixture: ComponentFixture<MediaGraphicsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MediaGraphicsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MediaGraphicsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
