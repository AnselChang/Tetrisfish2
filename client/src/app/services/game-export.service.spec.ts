import { TestBed } from '@angular/core/testing';

import { GameExportService } from './game-export.service';

describe('GameExportService', () => {
  let service: GameExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
