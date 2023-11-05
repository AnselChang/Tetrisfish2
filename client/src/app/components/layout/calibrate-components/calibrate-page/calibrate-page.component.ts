import { Component } from '@angular/core';
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
    private extractedStateService: ExtractedStateService
    ) {}

  public get settings() {
    return this.captureSettingsService.get();
  }

  public get extractedState() {
    return this.extractedStateService.get();
  }

}
