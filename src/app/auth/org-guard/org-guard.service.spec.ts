import {inject, TestBed} from '@angular/core/testing';

import {OrgGuardService} from './org-guard.service';

describe('OrgGuardService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [OrgGuardService]
        });
    });

    it('should be created', inject([OrgGuardService], (service: OrgGuardService) => {
        expect(service).toBeTruthy();
    }));
});
