import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MediaPressComponent} from './media-press.component';

describe('MediaPressComponent', () => {
    let component: MediaPressComponent;
    let fixture: ComponentFixture<MediaPressComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MediaPressComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MediaPressComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
