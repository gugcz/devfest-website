import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumPartnersComponent } from './premium-partners.component';

describe('PremiumPartnersComponent', () => {
  let component: PremiumPartnersComponent;
  let fixture: ComponentFixture<PremiumPartnersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PremiumPartnersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PremiumPartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
