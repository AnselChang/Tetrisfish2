import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { ThresholdType } from 'client/src/app/models/capture-models/capture-settings';
import { CaptureFrameService, CaptureMode } from 'client/src/app/services/capture/capture-frame.service';
import { CaptureSettingsService } from 'client/src/app/services/capture/capture-settings.service';
import { ExtractedStateService } from 'client/src/app/services/capture/extracted-state.service';
import { VideoCaptureService } from 'client/src/app/services/capture/video-capture.service';

@Component({
  selector: 'app-calibrate-page',
  templateUrl: './calibrate-page.component.html',
  styleUrls: ['./calibrate-page.component.scss']
})
export class CalibratePageComponent {
  @Output() onSwitchMode = new EventEmitter<void>();
  @Input() captureVideoElement!: ElementRef<HTMLVideoElement>;

  readonly ThresholdType = ThresholdType;

  constructor(
    public videoCaptureService: VideoCaptureService,
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

  public isCalibrated(): boolean {
    return this.captureSettingsService.get().isCalibrated();
  }
}
