import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChoosePicturePage } from './choose-picture.page';

describe('ChoosePicturePage', () => {
  let component: ChoosePicturePage;
  let fixture: ComponentFixture<ChoosePicturePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ChoosePicturePage],
    }).compileComponents();

    fixture = TestBed.createComponent(ChoosePicturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
