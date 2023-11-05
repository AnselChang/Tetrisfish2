import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TetrisPanelItemComponent } from './tetris-panel-item.component';

describe('TetrisPanelItemComponent', () => {
  let component: TetrisPanelItemComponent;
  let fixture: ComponentFixture<TetrisPanelItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TetrisPanelItemComponent]
    });
    fixture = TestBed.createComponent(TetrisPanelItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
