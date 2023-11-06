import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VideoCaptureService } from 'client/src/app/services/capture/video-capture.service';

export enum PlayMode {
  PLAY = "PLAY",
  CALIBRATE = "CALIBRATE"
}

@Component({
  selector: 'app-play-calibrate',
  templateUrl: './play-calibrate.component.html',
  styleUrls: ['./play-calibrate.component.scss']
})
export class PlayCalibrateComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement') captureVideoElement!: ElementRef<HTMLVideoElement>;

  
  private mode: PlayMode = PlayMode.PLAY;

  constructor(private videoCaptureService: VideoCaptureService) {

  }

  ngOnInit(): void {
    this.videoCaptureService.initVideoDevices();
  }

  ngAfterViewInit(): void {
      this.videoCaptureService.registerVideo(this.captureVideoElement);
  }

  ngOnDestroy(): void {
      this.videoCaptureService.stopCapture();
  }

  public isPlayPage(): boolean {
    return this.mode === PlayMode.PLAY;
  }

  public switchPage(): void {
    if (this.mode === PlayMode.PLAY) {
      this.mode = PlayMode.CALIBRATE;
    } else {
      this.mode = PlayMode.PLAY;
    }
  }

}
