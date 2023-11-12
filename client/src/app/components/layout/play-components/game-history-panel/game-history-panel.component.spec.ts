import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHistoryPanelComponent } from './game-history-panel.component';

describe('GameHistoryPanelComponent', () => {
  let component: GameHistoryPanelComponent;
  let fixture: ComponentFixture<GameHistoryPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameHistoryPanelComponent]
    });
    fixture = TestBed.createComponent(GameHistoryPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
