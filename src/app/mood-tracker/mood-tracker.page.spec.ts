import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoodTrackerPage } from './mood-tracker.page';

describe('MoodTrackerPage', () => {
  let component: MoodTrackerPage;
  let fixture: ComponentFixture<MoodTrackerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MoodTrackerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
