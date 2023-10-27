import { TestBed } from '@angular/core/testing';

import { BoardCreationCacheService } from './board-creation-cache.service';

describe('BoardCreationCacheService', () => {
  let service: BoardCreationCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardCreationCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
