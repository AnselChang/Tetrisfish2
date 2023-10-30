import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FloodFill, FloodFillImage } from '../../scripts/floodfill';
import { Rectangle } from '../../models/game-models/capture-settings';
import { CaptureSettingsService } from './capture-settings.service';

export enum CaptureMode {
  NORMAL = "NORMAL",
  CLICK_ON_BOARD = "CLICK_ON_BOARD", // click to set board bounding box through flood fill
}

@Injectable({
  providedIn: 'root'
})
export class CaptureFrameService implements FloodFillImage {

  public mode$ = new BehaviorSubject<CaptureMode>(CaptureMode.NORMAL);

  private frame?: Uint8ClampedArray;
  private width?: number;
  private height?: number;

  public boardFloodfill?: boolean[][];

  constructor(private captureSettingsService: CaptureSettingsService) { }

  public hasFrame(): boolean {
    return this.frame !== undefined && this.width !== undefined && this.height !== undefined;
  }

  public setFrame(frame: Uint8ClampedArray, width: number, height: number): void {
    this.frame = frame;
    this.width = width;
    this.height = height;
  }

  public resetFrame(): void {
    this.frame = undefined;
    this.width = undefined;
    this.height = undefined;
  }

  // get RGB for pixel at (x, y), A is ignored
  public getPixelAt(x: number, y: number): [number, number, number] | undefined {
 
    if (!this.hasFrame()) {
      return undefined;
    }

    if (x < 0 || x >= this.width!) {
      return undefined;
    }

    if (y < 0 || y >= this.height!) {
      return undefined;
    }

    x = Math.floor(x);
    y = Math.floor(y);

    const index = (y * this.width! + x) * 4;
    return [this.frame![index], this.frame![index + 1], this.frame![index + 2]];
  }

  // if each varies by less than 10, then they are similar
  public floodfillCondition(colorA: [number, number, number], colorB: [number, number, number]): boolean {
    return Math.abs(colorA[0] - colorB[0]) < 10 &&
      Math.abs(colorA[1] - colorB[1]) < 10 &&
      Math.abs(colorA[2] - colorB[2]) < 10;
  }

  public resetFloodFill(): void {
    this.boardFloodfill = undefined;
  }

  public clickAt(x: number, y: number): void {

    // get pixel color
    const color = this.getPixelAt(x, y);
    console.log("Clicked at", x, y, color);

    const floodfill = new FloodFill(this.width!, this.height!);
    floodfill.floodfill(this, x, y, this.floodfillCondition.bind(this));

    this.boardFloodfill = floodfill.getFilled();
    this.captureSettingsService.get().boardRect = floodfill.getRect();



    // reset to normal mode
    this.resetCaptureMode();
  }

  public resetCaptureMode(): void {
    this.mode$.next(CaptureMode.NORMAL);
  }

}
