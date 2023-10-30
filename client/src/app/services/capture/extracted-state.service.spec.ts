import { TestBed } from '@angular/core/testing';

import { ExtractedStateService } from './extracted-state.service';

describe('ExtractedDataService', () => {
  let service: ExtractedStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtractedStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
