import { Component } from '@angular/core';
import { CaptureFrameService, CaptureMode } from 'client/src/app/services/capture/capture-frame.service';
import { CaptureSettingsService } from 'client/src/app/services/capture/capture-settings.service';
import { ExtractedStateService } from 'client/src/app/services/capture/extracted-state.service';

@Component({
  selector: 'app-calibrate-page',
  templateUrl: './calibrate-page.component.html',
  styleUrls: ['./calibrate-page.component.scss']
})
export class CalibratePageComponent {

  constructor(
    private captureSettingsService: CaptureSettingsService,
    private extractedStateService: ExtractedStateService,
    private captureFrameService: CaptureFrameService
    ) {}

  public get settings() {
    return this.captureSettingsService.get();
  }

  public get extractedState() {
    return this.extractedStateService.get();
  }

  public determineBoundingBoxes(event: Event) {
    if (this.captureFrameService.hasFrame()) {
      event.stopPropagation();
      this.captureFrameService.mode$.next(CaptureMode.CLICK_ON_BOARD);
    }
  }

}
