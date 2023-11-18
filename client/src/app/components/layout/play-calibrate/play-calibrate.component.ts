import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CaptureSettingsService } from 'client/src/app/services/capture/capture-settings.service';
import { VideoCaptureService } from 'client/src/app/services/capture/video-capture.service';

@Component({
  selector: 'app-play-calibrate',
  templateUrl: './play-calibrate.component.html',
  styleUrls: ['./play-calibrate.component.scss']
})
export class PlayCalibrateComponent implements OnInit {

  constructor(
    private router: Router,
    private videoCaptureService: VideoCaptureService,
    private captureSettingsService: CaptureSettingsService
  ) {}

  shouldLoadCalibrationFirst(): boolean {
    return !this.videoCaptureService.isCapturing() || !this.captureSettingsService.get().isCalibrated();
  }

  // redirect to the calibration or play page depending on the state of the capture
  ngOnInit(): void {
    const route = this.shouldLoadCalibrationFirst() ? '/calibrate' : '/play';
    this.router.navigate([route]);
  }


}
