import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeonLogoComponent } from './neon-logo.component';

describe('NeonLogoComponent', () => {
  let component: NeonLogoComponent;
  let fixture: ComponentFixture<NeonLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeonLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeonLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
