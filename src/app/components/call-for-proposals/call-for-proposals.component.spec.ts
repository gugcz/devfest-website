import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CallForProposalsComponent} from './call-for-proposals.component';

describe('CallForProposalsComponent', () => {
    let component: CallForProposalsComponent;
    let fixture: ComponentFixture<CallForProposalsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CallForProposalsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CallForProposalsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
