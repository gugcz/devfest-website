import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeonDateComponent } from './neon-date.component';

describe('NeonDateComponent', () => {
  let component: NeonDateComponent;
  let fixture: ComponentFixture<NeonDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeonDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeonDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
