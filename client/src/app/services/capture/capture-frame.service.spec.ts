import { TestBed } from '@angular/core/testing';

import { CaptureFrameService } from './capture-frame.service';

describe('CaptureFrameService', () => {
  let service: CaptureFrameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaptureFrameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
