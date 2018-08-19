import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppInvitationComponent } from './app-invitation.component';

describe('AppInvitationComponent', () => {
  let component: AppInvitationComponent;
  let fixture: ComponentFixture<AppInvitationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppInvitationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
