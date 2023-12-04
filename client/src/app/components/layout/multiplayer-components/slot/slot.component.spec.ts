import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotComponent } from './slot.component';

describe('SlotComponent', () => {
  let component: SlotComponent;
  let fixture: ComponentFixture<SlotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SlotComponent]
    });
    fixture = TestBed.createComponent(SlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
