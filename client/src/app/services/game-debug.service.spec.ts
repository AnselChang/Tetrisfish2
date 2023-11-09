import { TestBed } from '@angular/core/testing';

import { GameDebugService } from './game-debug.service';

describe('GameDebugService', () => {
  let service: GameDebugService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameDebugService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
