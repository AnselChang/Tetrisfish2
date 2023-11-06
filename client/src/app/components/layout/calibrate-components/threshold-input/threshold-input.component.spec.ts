import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThresholdInputComponent } from './threshold-input.component';

describe('ThresholdInputComponent', () => {
  let component: ThresholdInputComponent;
  let fixture: ComponentFixture<ThresholdInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThresholdInputComponent]
    });
    fixture = TestBed.createComponent(ThresholdInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
