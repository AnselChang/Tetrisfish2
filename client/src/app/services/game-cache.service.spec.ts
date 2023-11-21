import { TestBed } from '@angular/core/testing';

import { GameCacheService } from './game-cache.service';

describe('GameCacheService', () => {
  let service: GameCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
