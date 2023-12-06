import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipButtonComponent } from './tooltip-button.component';

describe('TooltipButtonComponent', () => {
  let component: TooltipButtonComponent;
  let fixture: ComponentFixture<TooltipButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TooltipButtonComponent]
    });
    fixture = TestBed.createComponent(TooltipButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
