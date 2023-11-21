import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedDigitComponent } from './animated-digit.component';

describe('AnimatedDigitComponent', () => {
  let component: AnimatedDigitComponent;
  let fixture: ComponentFixture<AnimatedDigitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnimatedDigitComponent]
    });
    fixture = TestBed.createComponent(AnimatedDigitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
