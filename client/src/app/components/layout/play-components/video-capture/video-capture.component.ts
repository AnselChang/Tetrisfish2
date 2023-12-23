// video-capture.component.ts
import { Component, OnInit, ElementRef, ViewChild, Renderer2, Input, AfterViewChecked, AfterViewInit, OnDestroy } from '@angular/core';
import { CaptureFrameService, CaptureMode } from 'client/src/app/services/capture/capture-frame.service';
import { CaptureSettingsService } from 'client/src/app/services/capture/capture-settings.service';
import { VideoCaptureService } from 'client/src/app/services/capture/video-capture.service';

@Component({
  selector: 'app-video-capture',
  templateUrl: './video-capture.component.html',
  styleUrls: ['./video-capture.component.scss']
})
export class VideoCaptureComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() captureVideoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  public isMouseOnVideo: boolean = false;

  private mouseX: number = 0;
  private mouseY: number = 0;

  private mouseClickListener: Function | null = null;

  constructor(
    public captureServ: VideoCaptureService,
    public captureFrameService: CaptureFrameService,
    private captureSettingsService: CaptureSettingsService,
    private renderer: Renderer2) {

      this.mouseClickListener = this.renderer.listen('document', 'click', this.onMouseClick.bind(this));

  }

  ngOnInit(): void {
  
  }

  ngAfterViewInit(): void {
      this.captureServ.registerCanvas(this.canvasElement, false);
  }

  public onMouseEnter(): void {
    this.isMouseOnVideo = true;
  }

  public onMouseLeave(): void {
    this.isMouseOnVideo = false;
  }

  public onMouseClick(): void {

    if (this.isMouseOnVideo && this.captureFrameService.mode$.getValue() === CaptureMode.CLICK_ON_BOARD) {
      console.log("yes");
      this.captureFrameService.floodfillBoard(Math.floor(this.mouseX), Math.floor(this.mouseY));
    } else {
      console.log("not");
      this.captureFrameService.resetCaptureMode();
    }

  }

  public onMouseMove(event: MouseEvent): void {
    const rect = this.canvasElement.nativeElement.getBoundingClientRect();
    const CANVAS_RESOLUTION_SCALE_X = this.canvasElement.nativeElement.width / this.captureServ.DISPLAY_WIDTH;
    const CANVAS_RESOLUTION_SCALE_Y = this.canvasElement.nativeElement.height / this.captureServ.DISPLAY_HEIGHT;
    this.mouseX = (event.clientX - rect.left) * CANVAS_RESOLUTION_SCALE_X;
    this.mouseY = (event.clientY - rect.top) * CANVAS_RESOLUTION_SCALE_Y;

  }

  public isCaptureModeNormal(): boolean {
    return this.captureFrameService.mode$.getValue() === CaptureMode.NORMAL;
  }

  public isCalibrated(): boolean {
    return this.captureSettingsService.get().isCalibrated();
  }

  public hasVideo(): boolean {
    return this.captureServ.isCapturing();
  }

  ngOnDestroy(): void {
    // remove listener
    if (this.mouseClickListener) {
      this.mouseClickListener();
      this.mouseClickListener = null;
    }
  }


}
