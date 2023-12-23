import { ElementRef, Injectable } from '@angular/core';
import { CaptureFrameService } from './capture-frame.service';
import { CaptureSettingsService } from './capture-settings.service';
import { ExtractedStateService } from './extracted-state.service';
import { Rectangle } from '../../models/capture-models/capture-settings';
import { Point } from '../../models/capture-models/point';
import BinaryGrid from '../../models/tetronimo-models/binary-grid';
import { OCRBox } from '../../models/capture-models/ocr-box';
import { GameStateMachineService } from '../game-state-machine/game-state-machine.service';
import { FpsTracker } from '../../models/fps-tracker';
import { MultiplayerService } from '../multiplayer/multiplayer.service';

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
  private isCaptureRunning: boolean = false;

  private onPlayPage: boolean = false;
  private isCalibrating: boolean = false;

  // how many times larger the canvas stored resolution is compared to display resolution
  // the higher the is, the more expensive OCR calculations are, but the more accurate they are
  // public readonly OCR_WIDTH = 900;
  // public readonly OCR_HEIGHT = 900;
  public readonly DISPLAY_WIDTH = 450;
  public readonly DISPLAY_HEIGHT = 450;

  private videoWidth?: number;
  private videoHeight?: number;
  // public readonly CANVAS_RESOLUTION_SCALE_X = this.OCR_WIDTH / this.DISPLAY_WIDTH;
  // public readonly CANVAS_RESOLUTION_SCALE_Y = this.OCR_HEIGHT / this.DISPLAY_HEIGHT;

  private fpsTracker = new FpsTracker();

  constructor(
    private captureFrameService: CaptureFrameService,
    private captureSettingsService: CaptureSettingsService,
    private extractedStateService: ExtractedStateService,
    private gameStateMachineService: GameStateMachineService,
    private multiplayerService: MultiplayerService,
    ) { }

  public initVideoDevices() {
    this.generateVideoDevicesList();
    navigator.mediaDevices.addEventListener('devicechange', this.generateVideoDevicesList.bind(this));
  }

  public registerVideo(videoElement: ElementRef<HTMLVideoElement>): void {
    this.videoElement = videoElement;
  }

  public getVideoElement(): ElementRef<HTMLVideoElement> {
    return this.videoElement;
  }

  public registerCanvas(canvasElement: ElementRef<HTMLCanvasElement>, isCanvasHidden: boolean): void {
    console.log("registering canvas", canvasElement, isCanvasHidden);
    this.canvasElement = canvasElement;
    this.isCanvasHidden = isCanvasHidden;

    this.updateCanvasResolution();
  }

  public isPaused(): boolean {
    return this.status === VideoPauseStatus.PAUSED;
  }

  public isCapturing(): boolean {
    return this.isCaptureRunning;
  }

  public isOnPlayPage(): boolean {
    return this.onPlayPage;
  }

  public enablePlaying(): void {
    this.onPlayPage = true;
  }

  public disablePlaying(): void {
    this.onPlayPage = false;
  }

  public onEnterCalibratePage(): void {
    this.isCalibrating = true;
    this.gameStateMachineService.onEnterCalibrationPage();

  }

  public onLeaveCalibratePage(): void {
    this.isCalibrating = false;
    this.gameStateMachineService.onLeaveCalibrationPage();

  }

  public isOnCalibratePage(): boolean {
    return this.isCalibrating;
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
          deviceId: this.selectedDevice.deviceId,
          width: {
            ideal: 1000,
          },
          // height: {
          //   ideal: this.OCR_HEIGHT
          // }
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
        video: {
          width: {
            ideal: 1000,
          },
          // height: {
          //   ideal: this.OCR_HEIGHT
          // }
        }
      });
      
      this.startCapture(mediaStream);

    } catch (error) {
      console.error('Error capturing screen:', error);
    }
  }

  // update canvas resolution to video resolution, if defined
  updateCanvasResolution(): void {
    if (this.videoWidth && this.videoHeight) {
      this.canvasElement.nativeElement.width = this.videoWidth;
      this.canvasElement.nativeElement.height = this.videoHeight;
      console.log("set canvas to video resolution", this.videoWidth, this.videoHeight);
    }
  }

  async startCapture(mediaStream: MediaStream) {
    
    try {
      this.videoElement.nativeElement.srcObject = mediaStream;
      this.permissionError = null; // Clear any previous error

      // set video resolution
      const videoTrack = mediaStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      this.videoWidth = settings.width;
      this.videoHeight = settings.height;
      console.log("set video resolution", this.videoWidth, this.videoHeight);

      this.updateCanvasResolution();

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

  public getFPS(): number {
    return this.fpsTracker.getFPS();
  }

  public getTickBusyDuration(): number {
    return this.fpsTracker.getTickBusyDuration();
  }

  public getTickIdleDuration(): number {
    return this.fpsTracker.getTickIdleDuration();
  }

  executeFrame(): void {

    // stop capture if flag is set to false
    if (!this.isCaptureRunning || !this.videoElement || !this.canvasElement) return;

    this.fpsTracker.tick();

    /* 
    STEP 1: Obtain the video frame and map it to the canvas
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
    STEP 2: Capture OCR data for the individual frame
    */
    if (this.captureSettingsService.get().isCalibrated()) {
      this.updateBoardOCR();
      this.updateNextBoxOCR();
      this.updateLevelOCR();
      this.updateLinesOCR();
    }

    /*
    STEP 3: Run game state machine for game start/end, placements, etc.
    */
    this.gameStateMachineService.tick();
    
    /*
     STEP 4: Draw all overlays if on calibrate page
    */
    if (this.isOnCalibratePage()) {
      this.drawCanvasOverlays(ctx);
    }

     /*
    STEP 2a: if multiplayer and playing game, send updates to server if there is any change
    */
    if (this.multiplayerService.isPlayingGame()) {
      this.multiplayerService.onNewVideoFrame();
    }

    /*
    STEP 5: Execute next frame after some delay
    */
    this.fpsTracker.endTick();

    // wait to maintain 30fps
    this.fpsTracker.idleToMaintainFPS(30).then(() => {
      requestAnimationFrame(this.executeFrame.bind(this));
    });
  }

  updateBoardOCR(): void {

    const level = this.gameStateMachineService.isInGame() ? this.gameStateMachineService.getCurrentGameStatus()?.level : undefined;

    // Extract colors for each OCR position for this frame
    const ocrResult = this.captureSettingsService.get().getBoard()?.evaluate(this.captureFrameService, level);
    
    // set extracted board to the computed OCR grid
    this.extractedStateService.get().setGrid(ocrResult!.binaryGrid!);
    this.extractedStateService.get().setColorGrid(ocrResult!.colorGrid!);

    // determine if game is paused
    this.extractedStateService.get().setPaused(this.captureSettingsService.get().getBoard()?.isPaused()!);
  }

  updateNextBoxOCR(): void {
    // Extract colors for each OCR position for this frame
    const nextGrid = this.captureSettingsService.get().getNext()?.evaluate(this.captureFrameService).binaryGrid;
    // set extracted next box to the computed OCR grid
    this.extractedStateService.get().setNext(nextGrid!);
  }

  updateLevelOCR() {
    const levelOCR = this.captureSettingsService.get().getLevel()!;
    levelOCR.evaluate(this.captureFrameService);

    const [level, confidence] = levelOCR.classifyNumber()!;
    this.extractedStateService.get().setLevel(level, confidence);
  }

  updateLinesOCR(): void {
    const linesOCR = this.captureSettingsService.get().getLines()!;
    linesOCR.evaluate(this.captureFrameService);
    
    const [lines, confidence] = linesOCR.classifyNumber()!;
    this.extractedStateService.get().setLines(lines, confidence);
  }

  drawCanvasOverlays(ctx: CanvasRenderingContext2D): void {

    // draw main board
    this.drawOCROverlay(ctx, this.captureSettingsService.get().getBoard());

    // draw next box
    this.drawOCROverlay(ctx, this.captureSettingsService.get().getNext());

    // draw level box
    this.drawOCROverlay(ctx, this.captureSettingsService.get().getLevel());

    // draw lines box
    this.drawOCROverlay(ctx, this.captureSettingsService.get().getLines());

    const board = this.captureSettingsService.get().getBoard();

    // draw next box point
    if (board) {
      const nextBoxPoints = board.getNextBoxCanvasLocations();
      nextBoxPoints.forEach((point) => this.drawCircle(ctx, point.x, point.y, 2, "rgb(0,0,255)"));
    }
    
    // draw level point
    if (board) {
      const levelPoint = board.getLevelCanvasLocation();
      this.drawCircle(ctx, levelPoint.x, levelPoint.y, 2, "rgb(0,0,255)");
    }

    // draw lines point
    if (board) {
      const linesPoint = board.getLinesCanvasLocation();
      this.drawCircle(ctx, linesPoint.x, linesPoint.y, 2, "rgb(0,0,255)");
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

  private drawOCROverlay(ctx: CanvasRenderingContext2D, ocr?: OCRBox): void {

    if (!ocr) return;

    // draw board rect
    this.drawRect(ctx, ocr.getBoundingRect(), "rgb(0, 255, 0)");

    // draw board positions
    this.drawOCRPositions(ctx, ocr.getPositions(), ocr.getGrid()!);
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
