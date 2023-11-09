import { Injectable } from '@angular/core';
import DebugFrame from '../models/capture-models/debug-frame';
import BinaryGrid from '../models/tetronimo-models/binary-grid';
import { TetrominoType } from '../models/tetronimo-models/tetromino';
import { GamePlacement } from '../models/game-models/game-placement';
import GameStatus from '../models/tetronimo-models/game-status';

/*
Manages all the game debug frames
*/

@Injectable({
  providedIn: 'root'
})
export class GameDebugService {

  private frames: DebugFrame[] = [];

  constructor() { }

  public resetNewGame(): void {
    this.frames = [];
  }

  public addFrame(grid: BinaryGrid, nextBoxType: TetrominoType | undefined) {
    this.frames.push(new DebugFrame(this.frames.length, grid.copy(), nextBoxType));
  }

  private get last(): DebugFrame {
    return this.frames[this.frames.length - 1];
  }

  // log a message for the current frame
  public log(message: string): void {
    console.log(message);
    this.last.log.push(message);
  }

  public logGrid(title: string, grid: BinaryGrid | undefined): void {
    this.last.logGrid.push([title, grid ? grid.copy() : undefined]);
  }

  public numFrames(): number {
    return this.frames.length;
  }

  public getFrame(index: number): DebugFrame {
    return this.frames[index];
  }

  public setPlacement(placement: GamePlacement) {
    this.last.placement = placement;
  }

  public setStatus(status: GameStatus) {
    this.last.status = status.copy();
  }

}
