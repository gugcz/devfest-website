import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MediaOthersComponent} from './media-others.component';

describe('MediaOthersComponent', () => {
    let component: MediaOthersComponent;
    let fixture: ComponentFixture<MediaOthersComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MediaOthersComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MediaOthersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
