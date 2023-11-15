import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Method, fetchServer, getBaseURL } from 'client/src/app/scripts/fetch-server';
import { VideoCaptureService } from 'client/src/app/services/capture/video-capture.service';
import { UserService } from 'client/src/app/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('videoElement') captureVideoElement!: ElementRef<HTMLVideoElement>;

  public pages = [
    ["/home", "Home"],
    ["/play", "Play"],
    ["/analysis", "Analysis"],
    ["/puzzles", "Puzzles"],
    ["/leaderboard", "Leaderboard"],
    ["/more", "More..."]
  ];

  constructor(
    public authService: UserService,
    private videoCaptureService: VideoCaptureService,
  ) {}


  ngOnInit(): void {
    this.videoCaptureService.initVideoDevices();
  }

  ngAfterViewInit(): void {
      this.videoCaptureService.registerVideo(this.captureVideoElement);
  }

  ngOnDestroy(): void {
    this.videoCaptureService.stopCapture();
}
}
