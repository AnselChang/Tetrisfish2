import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipIndicatorComponent } from './tooltip-indicator.component';

describe('TooltipIndicatorComponent', () => {
  let component: TooltipIndicatorComponent;
  let fixture: ComponentFixture<TooltipIndicatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TooltipIndicatorComponent]
    });
    fixture = TestBed.createComponent(TooltipIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
