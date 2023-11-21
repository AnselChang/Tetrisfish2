import { TestBed } from '@angular/core/testing';

import { GameSessionHistoryService } from './game-session-history.service';

describe('GameHistoryService', () => {
  let service: GameSessionHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameSessionHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
