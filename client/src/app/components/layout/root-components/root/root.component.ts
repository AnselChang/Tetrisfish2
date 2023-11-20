import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Method, fetchServer, getBaseURL } from 'client/src/app/scripts/fetch-server';
import { loginWithDiscord } from 'client/src/app/scripts/login';
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
    ["/play-calibrate", "Play"],
    ["/analysis", "Learn"],
    ["/puzzles", "Puzzles"],
    ["/leaderboard", "Leaderboard"],
    ["/more", "More..."]
  ];

  constructor(
    public userService: UserService,
    private videoCaptureService: VideoCaptureService,
    private router: Router
  ) {}


  async ngOnInit() {
    await this.userService.updateFromServer();
    this.videoCaptureService.initVideoDevices();
  }

  ngAfterViewInit(): void {
      this.videoCaptureService.registerVideo(this.captureVideoElement);
  }

  login() {
    loginWithDiscord(this.router);
  }

  ngOnDestroy(): void {
    this.videoCaptureService.stopCapture();
}
}
