import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterNowButtonComponent } from './register-now-button.component';

describe('RegisterNowButtonComponent', () => {
  let component: RegisterNowButtonComponent;
  let fixture: ComponentFixture<RegisterNowButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterNowButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterNowButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
