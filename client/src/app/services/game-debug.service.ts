import { Injectable } from '@angular/core';
import DebugFrame from '../models/capture-models/debug-frame';
import BinaryGrid from '../models/tetronimo-models/binary-grid';
import { TetrominoType } from '../models/tetronimo-models/tetromino';
import { GamePlacement } from '../models/game-models/game-placement';
import GameStatus from '../models/tetronimo-models/game-status';
import { UserService } from './user.service';
import { Method, fetchServer } from '../scripts/fetch-server';
import { Game } from '../models/game-models/game';
import { SmartGameStatus } from '../models/tetronimo-models/smart-game-status';

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
  private submittingBugReport = false;

  constructor(private userService: UserService) { }

  // take a single frame and serialize it into json
  private serializeFrame(frame: DebugFrame): any {
    const serializedFrame = {
      index: frame.index,
      grid: frame.grid._getAsString(),
      nextBoxType: frame.nextBoxType,
      log: frame.log,
      logGrid: frame.logGrid.map(([title, grid]) => [title, grid ? grid._getAsString() : undefined]),
      status: {
        level: frame.status.level,
        score: frame.status.score,
        lines: frame.status.lines,
      },
      placement: frame.placement ? {
        index: frame.placement.index,
        grid: frame.placement.grid._getAsString(),
        currentPieceType: frame.placement.currentPieceType,
        nextPieceType: frame.placement.nextPieceType,
        statusBeforePlacement: {
          startLevel: frame.placement.statusBeforePlacement.startLevel,
          level: frame.placement.statusBeforePlacement.level,
          score: frame.placement.statusBeforePlacement.score,
          lines: frame.placement.statusBeforePlacement.lines,
        },

      } : undefined,
    };

    return serializedFrame;

  }

  private deserializeFrame(data: any): DebugFrame {
    const frame = new DebugFrame(data["index"], BinaryGrid.fromString(data["grid"]), data["nextBoxType"]);
    frame.log = data["log"];

    const logGrid = data["logGrid"] as [string, string | undefined][];
    frame.logGrid = logGrid.map(([title, grid]) => [title, grid ? BinaryGrid.fromString(grid) : undefined]);
    frame.status = new GameStatus(data["status"]["level"], data["status"]["lines"], data["status"]["score"]);

    const placement = data["placement"];
    if (placement) {
      frame.placement = new GamePlacement(
        placement["index"],
        BinaryGrid.fromString(placement["grid"]),
        placement["currentPieceType"],
        placement["nextPieceType"],
        new SmartGameStatus(placement["startLevel"], placement["lines"], placement["score"], placement["level"])
      );
    }

    return frame;
  }

  // take the game debug state and serialize it into json
  public serialize(): any {

    // get the index of second to last placement
    let secondToLastIndex = 0;
    let lastIndex = 0;
    for (let index = 0; index < this.frames.length; index++) {
      const frame = this.frames[index];
      if (frame.placement !== undefined) {
        secondToLastIndex = lastIndex;
        lastIndex = index;
      }
    }
    
    console.log("Second to last index:", secondToLastIndex);
    console.log(this.getFrame(secondToLastIndex));

    // only send the frames from the second to last placement onward, and cap to 500 frames to reduce server load
    const clippedFrames = this.frames.slice(secondToLastIndex, this.frames.length).slice(0, 500);

    const data = {
      id: this.gameID,
      frames: clippedFrames.map(frame => this.serializeFrame(frame)),
    }

    console.log("Saving", data);
    return data;
  }

  // take serialized game debug data and load it into the game debug state
  public deserialize(data: any) {
    console.log("Loading", data);

    this.resetNewGame(data["id"]);
    this.frames = data["frames"].map((frameData: any) => this.deserializeFrame(frameData));

  }

  // given a gameID, load the bug report from the server and update the game debug state to that game
  public async loadAndDeserialize(gameID: string | undefined) {

    if (!gameID) {
      console.log("No gameID provided. Not loading bug report from server.");
      this.bugReportSubmitted = false;
      return;
    }

    const {status, content} = await fetchServer(Method.GET, "/api/get-bug-report", { id: gameID });
    console.log("Bug report:", status, content);

    if (status === 404) {
      console.log("Bug report does not exist:", gameID);
      alert("Bug report does not exist.");
      return;
    }

    this.deserialize(content);
    this.bugReportSubmitted = true;

  }

  async submitBugReport() {

    this.submittingBugReport = true;

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
    this.submittingBugReport = false;
  }

  public isSubmittingBugReport(): boolean {
    return this.submittingBugReport;
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

  public getGameID(): string | undefined {
    return this.gameID;
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
