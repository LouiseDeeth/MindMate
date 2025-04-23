import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BreathingModalComponent } from './breathing-modal.component';

describe('BreathingModalComponent', () => {
  let component: BreathingModalComponent;
  let fixture: ComponentFixture<BreathingModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BreathingModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BreathingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
