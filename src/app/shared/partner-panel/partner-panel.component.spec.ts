import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerPanelComponent } from './partner-panel.component';

describe('PartnerPanelComponent', () => {
  let component: PartnerPanelComponent;
  let fixture: ComponentFixture<PartnerPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
