import { TestBed } from '@angular/core/testing';

import { GameStateMachineService } from './game-state-machine.service';

describe('GameStateMachineService', () => {
  let service: GameStateMachineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateMachineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
