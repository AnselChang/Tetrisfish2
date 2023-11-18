import { Injectable } from '@angular/core';
import DebugFrame from '../models/capture-models/debug-frame';
import BinaryGrid from '../models/tetronimo-models/binary-grid';
import { TetrominoType } from '../models/tetronimo-models/tetromino';
import { GamePlacement } from '../models/game-models/game-placement';
import GameStatus from '../models/tetronimo-models/game-status';
import { UserService } from './user.service';
import { Method, fetchServer } from '../scripts/fetch-server';
import { Game } from '../models/game-models/game';

/*
Manages all the game debug frames
*/

@Injectable({
  providedIn: 'root'
})
export class GameDebugService {

  private frames: DebugFrame[] = [];
  private gameID?: string;

  private bugReportSubmitted = false;

  constructor(private userService: UserService) { }

  public serialize(): any {

  }

  public async loadAndDeserialize(gameID: string) {

    this.bugReportSubmitted = false;

    const {status, content} = await fetchServer(Method.GET, "/api/get-bug-report", { id: gameID });
    console.log("Bug report:", status, content);

    if (status === 404) {
      console.log("Bug report does not exist:", gameID);
      alert("Bug report does not exist.");
      return;
    }

    console.log("Loading", content);

  }

  async submitBugReport() {

    if (!this.gameID || this.frames.length === 0) {
      alert("No game to submit.");
      return;
    }

    const request = {
      gameID: this.gameID!,
      username: this.userService.getUsername(),
      startlevel: this.first.status.level,
      endLines: this.last.status.lines,
      endScore: this.last.status.score,
      data: this.serialize(),
    };

    await fetchServer(Method.POST, "/api/send-bug-report", request);

    this.bugReportSubmitted = true;
  }

  public isBugReportSubmitted(): boolean {
    return this.bugReportSubmitted;
  }

  public resetNewGame(gameID: string): void {
    this.frames = [];
    this.gameID = gameID;
    this.bugReportSubmitted = false;
  }

  public exists(): boolean {
    return this.frames.length > 0;
  }

  public addFrame(grid: BinaryGrid, nextBoxType: TetrominoType | undefined) {
    this.frames.push(new DebugFrame(this.frames.length, grid.copy(), nextBoxType));
  }

  public get first(): DebugFrame {
    return this.frames[0];
  }

  public get last(): DebugFrame {
    return this.frames[this.frames.length - 1];
  }

  // log a message for the current frame
  public log(message: string): void {
    //console.log(message);
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
