import { TestBed } from '@angular/core/testing';

import { LeaderboardAccuracyCacheService } from './leaderboard-accuracy-cache.service';

describe('LeaderboardAccuracyCacheService', () => {
  let service: LeaderboardAccuracyCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaderboardAccuracyCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
