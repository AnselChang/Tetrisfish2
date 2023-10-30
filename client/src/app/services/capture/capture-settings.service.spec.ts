import { TestBed } from '@angular/core/testing';

import { CaptureSettingsService } from './capture-settings.service';

describe('CaptureDataService', () => {
  let service: CaptureSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaptureSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
