import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingTotalsComponent } from './rating-totals.component';

describe('RatingTotalsComponent', () => {
  let component: RatingTotalsComponent;
  let fixture: ComponentFixture<RatingTotalsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RatingTotalsComponent]
    });
    fixture = TestBed.createComponent(RatingTotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
