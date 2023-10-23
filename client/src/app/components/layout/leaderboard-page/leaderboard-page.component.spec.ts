import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardPageComponent } from './leaderboard-page.component';

describe('LeaderboardPageComponent', () => {
  let component: LeaderboardPageComponent;
  let fixture: ComponentFixture<LeaderboardPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaderboardPageComponent]
    });
    fixture = TestBed.createComponent(LeaderboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
