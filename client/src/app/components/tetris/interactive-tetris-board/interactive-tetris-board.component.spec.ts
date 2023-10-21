import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveTetrisBoardComponent } from './interactive-tetris-board.component';

describe('InteractiveTetrisBoardComponent', () => {
  let component: InteractiveTetrisBoardComponent;
  let fixture: ComponentFixture<InteractiveTetrisBoardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InteractiveTetrisBoardComponent]
    });
    fixture = TestBed.createComponent(InteractiveTetrisBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
