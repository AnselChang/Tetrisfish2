import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TetrisPanelComponent } from './tetris-panel.component';

describe('TetrisPanelComponent', () => {
  let component: TetrisPanelComponent;
  let fixture: ComponentFixture<TetrisPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TetrisPanelComponent]
    });
    fixture = TestBed.createComponent(TetrisPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
