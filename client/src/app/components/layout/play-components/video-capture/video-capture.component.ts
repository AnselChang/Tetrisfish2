// video-capture.component.ts
import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { Rectangle } from 'client/src/app/models/game-models/capture-settings';
import { sleep } from 'client/src/app/scripts/sleep';
import { CaptureFrameService, CaptureMode } from 'client/src/app/services/capture/capture-frame.service';
import { CaptureSettingsService } from 'client/src/app/services/capture/capture-settings.service';

enum VideoPauseStatus {
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
}

@Component({
  selector: 'app-video-capture',
  templateUrl: './video-capture.component.html',
  styleUrls: ['./video-capture.component.scss']
})
export class VideoCaptureComponent implements OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  videoDevices: (MediaDeviceInfo | null)[] = [];
  selectedDevice: MediaDeviceInfo | null = null;
  permissionError: string | null = null;

  public status = VideoPauseStatus.PLAYING;
  public isMouseOnVideo: boolean = false;

  private mouseX: number = 0;
  private mouseY: number = 0;

  private mouseClickListener: Function | null = null;

  constructor(
    private captureSettingsService: CaptureSettingsService,
    public captureFrameService: CaptureFrameService,
    private renderer: Renderer2) {

    this.captureFrameService.mode$.subscribe(mode => {
      
      // If enter special mode, listen for mouse clicks on the board
      if (mode === CaptureMode.CLICK_ON_BOARD) {
        this.mouseClickListener = this.renderer.listen('document', 'click', this.onMouseClick.bind(this));
      }
    });

  }

  ngOnInit(): void {
    this.generateVideoDevicesList();
    navigator.mediaDevices.addEventListener('devicechange', this.generateVideoDevicesList.bind(this));
  
  }

  public onMouseEnter(): void {
    this.isMouseOnVideo = true;
  }

  public onMouseLeave(): void {
    this.isMouseOnVideo = false;
  }

  public onMouseClick(): void {

    if (this.isMouseOnVideo && this.captureFrameService.mode$.getValue() === CaptureMode.CLICK_ON_BOARD) {
      this.captureFrameService.clickAt(Math.floor(this.mouseX), Math.floor(this.mouseY));
    } else {
      this.captureFrameService.resetCaptureMode();
    }

    // remove listener
    if (this.mouseClickListener) {
      this.mouseClickListener();
      this.mouseClickListener = null;
    }

  }

  public onMouseMove(event: MouseEvent): void {
    const rect = this.canvasElement.nativeElement.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;

  }

  public isCaptureModeNormal(): boolean {
    return this.captureFrameService.mode$.getValue() === CaptureMode.NORMAL;
  }

  public isPaused(): boolean {
    return this.status === VideoPauseStatus.PAUSED;
  }

  public togglePause(): void {
    if (this.status === VideoPauseStatus.PLAYING) {
      this.status = VideoPauseStatus.PAUSED;
      this.videoElement.nativeElement.pause();
    } else {
      this.status = VideoPauseStatus.PLAYING;
      this.videoElement.nativeElement.play();

    }
  }


  generateVideoDevicesList(): void {
    this.captureFrameService.resetFrame();
    navigator.mediaDevices.enumerateDevices().then(devices => {
      this.videoDevices = devices.filter(device => device.kind === 'videoinput');
      this.videoDevices.unshift(null); // Add a null option to the beginning of the list
      console.log("Video devices:", this.videoDevices);
    });
  }

  async onDeviceChange() {

    if (this.selectedDevice) {

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: this.selectedDevice.deviceId
        }
      });
      
      await this.startVideo(mediaStream);
      
    } else {
      this.stopVideo();
    }

  }

  async screenCapture(): Promise<void> {

    try {

      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      
      this.startVideo(mediaStream);

    } catch (error) {
      console.error('Error capturing screen:', error);
    }
  }

  async startVideo(mediaStream: MediaStream) {
    
    try {
      this.videoElement.nativeElement.srcObject = mediaStream;
      this.permissionError = null; // Clear any previous error

      // Start reading the pixels
      this.status = VideoPauseStatus.PLAYING;
      this.readPixels();

    } catch (err) {

      this.permissionError = "Error accessing video device. Please ensure permissions are granted.";
      console.error("Error accessing video device:", err);
    };
  }

  stopVideo() {
    this.videoElement.nativeElement.srcObject = null;
  }

  readPixels(): void {
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    
    // Draw the video frame onto the canvas
    ctx.drawImage(this.videoElement.nativeElement, 0, 0, canvas.width, canvas.height);

    // Get the pixel data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData.data;
    this.captureFrameService.setFrame(pixelData, canvas.width, canvas.height);

    // draw floodfill if it exists
    if (this.captureFrameService.boardFloodfill) {
      this.drawFloodFill(ctx, this.captureFrameService.boardFloodfill!);
    }

    // draw board rect if it exists
    if (this.captureSettingsService.get().boardRect) {
      this.drawRect(ctx, this.captureSettingsService.get().boardRect!, "rgb(0, 255, 0)");
    }

    // Process the pixelData as needed
    //console.log(pixelData);

    requestAnimationFrame(this.readPixels.bind(this));
  }

  private drawFloodFill(ctx: CanvasRenderingContext2D, floodfill: boolean[][]): void {
    for (let y = 0; y < floodfill.length; y++) {
      for (let x = 0; x < floodfill[y].length; x++) {
        if (floodfill[y][x]) {
          ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  private drawRect(ctx: CanvasRenderingContext2D, boardRect: Rectangle, color: string): void {
    ctx.strokeStyle = color;

    // draw border so that the border is outside the rect
    const BORDER_WIDTH = 2;
    ctx.lineWidth = BORDER_WIDTH;
    ctx.strokeRect(
      boardRect.left - BORDER_WIDTH,
      boardRect.top - BORDER_WIDTH,
      boardRect.right - boardRect.left + BORDER_WIDTH*2,
      boardRect.bottom - boardRect.top + BORDER_WIDTH*2);
  }

}
