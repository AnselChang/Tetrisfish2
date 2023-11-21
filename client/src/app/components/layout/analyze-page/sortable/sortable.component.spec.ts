import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortableComponent } from './sortable.component';

describe('SortableComponent', () => {
  let component: SortableComponent;
  let fixture: ComponentFixture<SortableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SortableComponent]
    });
    fixture = TestBed.createComponent(SortableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
