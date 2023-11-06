// video-capture.component.ts
import { Component, OnInit, ElementRef, ViewChild, Renderer2, Input, AfterViewChecked, AfterViewInit } from '@angular/core';
import { CaptureFrameService, CaptureMode } from 'client/src/app/services/capture/capture-frame.service';
import { VideoCaptureService } from 'client/src/app/services/capture/video-capture.service';

@Component({
  selector: 'app-video-capture',
  templateUrl: './video-capture.component.html',
  styleUrls: ['./video-capture.component.scss']
})
export class VideoCaptureComponent implements OnInit, AfterViewInit {
  @Input() captureVideoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  public isMouseOnVideo: boolean = false;

  private mouseX: number = 0;
  private mouseY: number = 0;

  private mouseClickListener: Function | null = null;

  constructor(
    public captureServ: VideoCaptureService,
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
    this.mouseX = (event.clientX - rect.left) * this.captureServ.CANVAS_RESOLUTION_SCALE_X;
    this.mouseY = (event.clientY - rect.top) * this.captureServ.CANVAS_RESOLUTION_SCALE_Y;

  }

  public isCaptureModeNormal(): boolean {
    return this.captureFrameService.mode$.getValue() === CaptureMode.NORMAL;
  }


}
