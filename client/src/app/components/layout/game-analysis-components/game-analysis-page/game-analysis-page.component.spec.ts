import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameAnalysisPageComponent } from './game-analysis-page.component';

describe('GameAnalysisPageComponent', () => {
  let component: GameAnalysisPageComponent;
  let fixture: ComponentFixture<GameAnalysisPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameAnalysisPageComponent]
    });
    fixture = TestBed.createComponent(GameAnalysisPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
