import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CaptureSettingsService } from 'client/src/app/services/capture/capture-settings.service';
import { VideoCaptureService } from 'client/src/app/services/capture/video-capture.service';
import { LoginStatus, UserService } from 'client/src/app/services/user.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-play-calibrate',
  templateUrl: './play-calibrate.component.html',
  styleUrls: ['./play-calibrate.component.scss']
})
export class PlayCalibrateComponent implements OnInit {

  constructor(
    private router: Router,
    private videoCaptureService: VideoCaptureService,
    private captureSettingsService: CaptureSettingsService,
    private userService: UserService
  ) {}

  shouldLoadCalibrationFirst(): boolean {
    return !this.videoCaptureService.isCapturing() || !this.captureSettingsService.get().isCalibrated();
  }

  // redirect to the calibration or play page depending on the state of the capture
  ngOnInit(): void {

    this.userService.loginStatus$.pipe(
      filter(status => status !== LoginStatus.LIMBO), // ignore unknown login status events
      take(1) // Take only the first value that passes the filter
    ).subscribe(status => {

      const loggedIn = status === LoginStatus.LOGGED_IN;

      console.log("Logged in?", loggedIn);

      let route;
      if (!loggedIn) route = '/how-to-play';
      else if (this.shouldLoadCalibrationFirst()) route = '/calibrate'
      else route = '/play';

      this.router.navigate([route]);
    });
  }


}
