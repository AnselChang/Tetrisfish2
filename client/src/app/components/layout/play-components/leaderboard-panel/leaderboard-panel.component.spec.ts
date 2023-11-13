import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardPanelComponent } from './leaderboard-panel.component';

describe('LeaderboardPanelComponent', () => {
  let component: LeaderboardPanelComponent;
  let fixture: ComponentFixture<LeaderboardPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaderboardPanelComponent]
    });
    fixture = TestBed.createComponent(LeaderboardPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
