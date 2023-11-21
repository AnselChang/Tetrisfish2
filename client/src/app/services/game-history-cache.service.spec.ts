import { TestBed } from '@angular/core/testing';

import { GameHistoryCacheService } from './game-history-cache.service';

describe('GameHistoryCacheService', () => {
  let service: GameHistoryCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameHistoryCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
