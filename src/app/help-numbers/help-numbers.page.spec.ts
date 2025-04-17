import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpNumbersPage } from './help-numbers.page';

describe('HelpNumbersPage', () => {
  let component: HelpNumbersPage;
  let fixture: ComponentFixture<HelpNumbersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpNumbersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
