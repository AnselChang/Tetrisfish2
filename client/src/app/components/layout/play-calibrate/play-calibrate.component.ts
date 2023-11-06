import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VideoCaptureService } from 'client/src/app/services/capture/video-capture.service';
import { GameStateMachineService, PlayCalibratePage } from 'client/src/app/services/game-state-machine/game-state-machine.service';



@Component({
  selector: 'app-play-calibrate',
  templateUrl: './play-calibrate.component.html',
  styleUrls: ['./play-calibrate.component.scss']
})
export class PlayCalibrateComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement') captureVideoElement!: ElementRef<HTMLVideoElement>;

  
  constructor(
    private videoCaptureService: VideoCaptureService,
    private gameService: GameStateMachineService,
    ) {

  }

  ngOnInit(): void {
    this.videoCaptureService.initVideoDevices();

    const page = this.videoCaptureService.isCapturing() ? PlayCalibratePage.PLAY : PlayCalibratePage.CALIBRATE;
    this.gameService.setPlayCalibratePage(page);
  }

  ngAfterViewInit(): void {
      this.videoCaptureService.registerVideo(this.captureVideoElement);
  }

  ngOnDestroy(): void {
      this.videoCaptureService.stopCapture();
  }

  // defaults to calibration page unless capture is running
  public isPlayPage(): boolean {
    return this.gameService.getPlayCalibratePage() === PlayCalibratePage.PLAY;
  }

  public switchPage(): void {
    if (this.gameService.getPlayCalibratePage() === PlayCalibratePage.PLAY) {
      this.gameService.setPlayCalibratePage(PlayCalibratePage.CALIBRATE);
    } else {
      this.gameService.setPlayCalibratePage(PlayCalibratePage.PLAY);
    }
  }

}
