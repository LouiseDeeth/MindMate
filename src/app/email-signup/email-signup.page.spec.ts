import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailSignupPage } from './email-signup.page';

describe('EmailSignupPage', () => {
  let component: EmailSignupPage;
  let fixture: ComponentFixture<EmailSignupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailSignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
