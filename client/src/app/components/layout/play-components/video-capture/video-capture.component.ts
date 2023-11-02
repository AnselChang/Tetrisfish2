// video-capture.component.ts
import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { Rectangle } from 'client/src/app/models/capture-models/capture-settings';
import { BoardOCRBox } from 'client/src/app/models/capture-models/ocr-box';
import { Point } from 'client/src/app/models/capture-models/point';
import BinaryGrid from 'client/src/app/models/tetronimo-models/binary-grid';
import { hsvToRgb } from 'client/src/app/scripts/color';
import { CaptureFrameService, CaptureMode } from 'client/src/app/services/capture/capture-frame.service';
import { CaptureSettingsService } from 'client/src/app/services/capture/capture-settings.service';
import { ExtractedStateService } from 'client/src/app/services/capture/extracted-state.service';

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

  // how many times larger the canvas stored resolution is compared to display resolution
  // the higher the is, the more expensive OCR calculations are, but the more accurate they are
  public readonly CANVAS_RESOLUTION_SCALE = 2;

  constructor(
    private captureSettingsService: CaptureSettingsService,
    public captureFrameService: CaptureFrameService,
    private extractedStateService: ExtractedStateService,
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
      this.captureFrameService.floodfillBoard(Math.floor(this.mouseX), Math.floor(this.mouseY));
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
    this.mouseX = (event.clientX - rect.left) * this.CANVAS_RESOLUTION_SCALE;
    this.mouseY = (event.clientY - rect.top) * this.CANVAS_RESOLUTION_SCALE;

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
      this.executeFrame();

    } catch (err) {

      this.permissionError = "Error accessing video device. Please ensure permissions are granted.";
      console.error("Error accessing video device:", err);
    };
  }

  stopVideo() {
    this.videoElement.nativeElement.srcObject = null;
  }

  executeFrame(): void {

    /* 
    STEP 1: Obtain the video frame
    */

    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    
    // Draw the video frame onto the canvas
    ctx.drawImage(this.videoElement.nativeElement, 0, 0, canvas.width, canvas.height);

    // Get the pixel data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData.data;
    this.captureFrameService.setFrame(pixelData, canvas.width, canvas.height);

    /*
    STEP 2: Process the data for the individual frame
    */

    // Extract colors for each OCR position for this frame
    this.captureSettingsService.get().getBoard()?.evaluate(this.captureFrameService);

    // set extracted state to the computed OCR grid
    this.extractedStateService.get().grid = this.captureSettingsService.get().getGrid()!;

    // determine if game is paused
    this.extractedStateService.get().isPaused = this.captureSettingsService.get().getBoard()?.isPaused()!;
    /*
     STEP 3: Draw all overlays
    */

    // draw board rect if it exists
    const boundingRect = this.captureSettingsService.get().getBoardBoundingRect();
    if (boundingRect) this.drawRect(ctx, boundingRect, "rgb(0, 255, 0)");

    // draw board positions if they exist
    const board = this.captureSettingsService.get().getBoard();
    if (board) this.drawOCRPositions(ctx, board.getPositions(), board.getGrid()!);

    // draw next box rect if it exists
    const nextBoundingRect = this.captureSettingsService.get().getNextBoundingRect();
    if (nextBoundingRect) this.drawRect(ctx, nextBoundingRect, "rgb(0, 0, 255)");

    // draw next box positions if they exist
    const next = this.captureSettingsService.get().getNext();
    if (next) this.drawOCRPositions(ctx, next.getPositions(), next.getGrid()!);

    // draw next box point
    if (board) {
      const nextBoxPoints = board.getNextBoxCanvasLocations();
      nextBoxPoints.forEach((point) => this.drawCircle(ctx, point.x, point.y, 2, "rgb(0,0,255)"));
    }

    requestAnimationFrame(this.executeFrame.bind(this));
  }

  // draw a rectangle given a rectangle, with border just outside of rectangle bounds
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

  // draw a dot for each OCR position
  private drawOCRPositions(ctx: CanvasRenderingContext2D, positions: Point[][], grid: BinaryGrid) {

    for (let yIndex = 0; yIndex < positions.length; yIndex++) {
      for (let xIndex = 0; xIndex < positions[yIndex].length; xIndex++) {
        const {x,y} = positions[yIndex][xIndex];
        const isMino = grid?.at(xIndex+1, yIndex+1);
        const color = isMino ? "rgb(0,255,0)" : "rgb(255,0,0)";
        this.drawCircle(ctx, x, y, 2, color);
      }
    }
  }

  // example: drawCircle(ctx, 50, 50, 25, 'black', 'red', 2)
  private drawCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    fill?: string | CanvasGradient | CanvasPattern,
    stroke?: string | CanvasGradient | CanvasPattern,
    strokeWidth?: number
  ): void {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = strokeWidth || 1; // Default to 1 if strokeWidth is not provided
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

}
