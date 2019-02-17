import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributePanelComponent } from './contribute-panel.component';

describe('ContributePanelComponent', () => {
  let component: ContributePanelComponent;
  let fixture: ComponentFixture<ContributePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContributePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
