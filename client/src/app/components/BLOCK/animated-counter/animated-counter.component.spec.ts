import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedCounterComponent } from './animated-counter.component';

describe('AnimatedCounterComponent', () => {
  let component: AnimatedCounterComponent;
  let fixture: ComponentFixture<AnimatedCounterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnimatedCounterComponent]
    });
    fixture = TestBed.createComponent(AnimatedCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
