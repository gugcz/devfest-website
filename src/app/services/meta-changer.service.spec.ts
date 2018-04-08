import { TestBed, inject } from '@angular/core/testing';

import { MetaChangerService } from './meta-changer.service';

describe('MetaChangerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MetaChangerService]
    });
  });

  it('should be created', inject([MetaChangerService], (service: MetaChangerService) => {
    expect(service).toBeTruthy();
  }));
});
