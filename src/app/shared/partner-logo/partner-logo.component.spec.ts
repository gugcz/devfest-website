import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerLogoComponent } from './partner-logo.component';

describe('PartnerLogoComponent', () => {
  let component: PartnerLogoComponent;
  let fixture: ComponentFixture<PartnerLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
