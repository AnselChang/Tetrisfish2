import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccuracyPanelComponent } from './accuracy-panel.component';

describe('AccuracyPanelComponent', () => {
  let component: AccuracyPanelComponent;
  let fixture: ComponentFixture<AccuracyPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccuracyPanelComponent]
    });
    fixture = TestBed.createComponent(AccuracyPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
