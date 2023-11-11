import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingSubsectionComponent } from './rating-subsection.component';

describe('RatingSubsectionComponent', () => {
  let component: RatingSubsectionComponent;
  let fixture: ComponentFixture<RatingSubsectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RatingSubsectionComponent]
    });
    fixture = TestBed.createComponent(RatingSubsectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
