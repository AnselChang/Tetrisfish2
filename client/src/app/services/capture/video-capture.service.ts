import { ElementRef, Injectable } from '@angular/core';
import { CaptureFrameService } from './capture-frame.service';
import { CaptureSettingsService } from './capture-settings.service';
import { ExtractedStateService } from './extracted-state.service';
import { Rectangle } from '../../models/capture-models/capture-settings';
import { Point } from '../../models/capture-models/point';
import BinaryGrid from '../../models/tetronimo-models/binary-grid';

export enum VideoPauseStatus {
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
}

@Injectable({
  providedIn: 'root'
})
export class VideoCaptureService {

  videoDevices: (MediaDeviceInfo | null)[] = [];
  selectedDevice: MediaDeviceInfo | null = null;
  permissionError: string | null = null;

  public status = VideoPauseStatus.PLAYING;

  private videoElement!: ElementRef<HTMLVideoElement>;
  private canvasElement!: ElementRef<HTMLCanvasElement>;
  private isCanvasHidden: boolean = false;

  // if flag is set to false, then executeFrame() loop will terminate
  public isCaptureRunning: boolean = false;

  // how many times larger the canvas stored resolution is compared to display resolution
  // the higher the is, the more expensive OCR calculations are, but the more accurate they are
  public readonly OCR_WIDTH = 900;
  public readonly OCR_HEIGHT = 900;
  public readonly DISPLAY_WIDTH = 450;
  public readonly DISPLAY_HEIGHT = 450;
  public readonly CANVAS_RESOLUTION_SCALE_X = this.OCR_WIDTH / this.DISPLAY_WIDTH;
  public readonly CANVAS_RESOLUTION_SCALE_Y = this.OCR_HEIGHT / this.DISPLAY_HEIGHT;

  constructor(
    private captureFrameService: CaptureFrameService,
    private captureSettingsService: CaptureSettingsService,
    private extractedStateService: ExtractedStateService
    ) { }

  public initVideoDevices() {
    this.generateVideoDevicesList();
    navigator.mediaDevices.addEventListener('devicechange', this.generateVideoDevicesList.bind(this));
  }

  public registerVideo(videoElement: ElementRef<HTMLVideoElement>): void {
    this.videoElement = videoElement;
  }

  public registerCanvas(canvasElement: ElementRef<HTMLCanvasElement>, isCanvasHidden: boolean): void {
    this.canvasElement = canvasElement;
    this.isCanvasHidden = isCanvasHidden;
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
    // this.captureFrameService.resetFrame();
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
      
      await this.startCapture(mediaStream);
      
    } else {
      this.stopCapture();
    }
  }

  async screenCapture(): Promise<void> {

    try {

      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      
      this.startCapture(mediaStream);

    } catch (error) {
      console.error('Error capturing screen:', error);
    }
  }

  async startCapture(mediaStream: MediaStream) {
    
    try {
      this.videoElement.nativeElement.srcObject = mediaStream;
      this.permissionError = null; // Clear any previous error

      // Start reading the pixels
      this.status = VideoPauseStatus.PLAYING;
      this.isCaptureRunning = true;
      this.executeFrame();

    } catch (err) {

      this.permissionError = "Error accessing video device. Please ensure permissions are granted.";
      console.error("Error accessing video device:", err);
    };
  }

  stopCapture() {
    this.isCaptureRunning = false
    this.videoElement.nativeElement.srcObject = null;
  }

  executeFrame(): void {

    // stop capture if flag is set to false
    if (!this.isCaptureRunning || !this.videoElement || !this.canvasElement) return;

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

    this.updateBoardOCR();
    this.updateNextBoxOCR();
    
    /*
     STEP 3: Draw all overlays
    */
    if (!this.isCanvasHidden) this.drawCanvasOverlays(ctx);

    requestAnimationFrame(this.executeFrame.bind(this));
  }

  updateBoardOCR(): void {
    // Extract colors for each OCR position for this frame
    const grid = this.captureSettingsService.get().getBoard()?.evaluate(this.captureFrameService);

    // set extracted board to the computed OCR grid
    this.extractedStateService.get().setGrid(grid!);

    // determine if game is paused
    this.extractedStateService.get().setPaused(this.captureSettingsService.get().getBoard()?.isPaused()!);
  }

  updateNextBoxOCR(): void {
    // Extract colors for each OCR position for this frame
    const nextGrid = this.captureSettingsService.get().getNext()?.evaluate(this.captureFrameService);
    // set extracted next box to the computed OCR grid
    this.extractedStateService.get().setNext(nextGrid!);
  }

  drawCanvasOverlays(ctx: CanvasRenderingContext2D): void {
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

    // draw pause points
    if (board && board?.hasEvaluation()) {
      for (let key of ["PAUSE_U", "PAUSE_S", "PAUSE_E"]) {
        const point = board.getSpecialPointLocation(key);
        const color = board.getSpecialPointColor(key);
        this.drawCircle(ctx, point.x, point.y, 2, "rgb(255,255,255");
      }
    }
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
        const isMino = grid?.at(xIndex, yIndex);
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
