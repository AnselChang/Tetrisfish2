import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibilityItemComponent } from './eligibility-item.component';

describe('EligibilityItemComponent', () => {
  let component: EligibilityItemComponent;
  let fixture: ComponentFixture<EligibilityItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EligibilityItemComponent]
    });
    fixture = TestBed.createComponent(EligibilityItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
