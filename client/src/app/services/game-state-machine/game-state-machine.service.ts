import { Injectable } from '@angular/core';
import { ExtractedStateService } from '../capture/extracted-state.service';
import { ExtractedState } from '../../models/capture-models/extracted-state';
import BinaryGrid, { BlockType } from '../../models/tetronimo-models/binary-grid';
import { GamePlacement } from '../../models/game-models/game-placement';
import { findFourConnectedComponent } from '../../scripts/connected-components';
import { IGameStatus } from '../../models/tetronimo-models/game-status';
import MoveableTetromino from '../../models/game-models/moveable-tetromino';
import { TetrominoType } from '../../models/tetronimo-models/tetromino';
import { SmartGameStatus } from '../../models/tetronimo-models/smart-game-status';
import { Grid } from 'blockly';
import DebugFrame from '../../models/capture-models/debug-frame';
import { GameDebugService } from '../game-debug.service';

/*
Handles the game lifecycle, from starting the game, processing each piece placement,
and ending the game.
*/

export enum PlayStatus {
  PLAYING = "PLAYING",
  NOT_PLAYING = "NOT_PLAYING"
}


export enum PlayCalibratePage {
  PLAY = "PLAY",
  CALIBRATE = "CALIBRATE"
}

enum MinoResult {
  NO_CHANGE = "NO_CHANGE",
  SPAWN = "SPAWN",
  LIMBO = "LIMBO" // some intermediate frame where a line clear is still happening, or capture is bad this frame
}

class SpawnData {
  constructor(
    public gridWithoutPlacement?: BinaryGrid,
    public gridWithPlacement?: BinaryGrid,
    public nextPieceType?: TetrominoType,
    public linesCleared?: number
  ) {}
}


/*
State machine with a lifetime of the duration of a game
Stores the last stable mino count, and can imply state changes when mino count changes
*/
class GridStateMachine {

  // "stable" means the last placement frame, or before the very first frame of the game
  private lastStableMinoCount = 0;

  // the grid right after a spawned piece with the spawned piece masked out
  private lastStableGridWithoutPlacement?: BinaryGrid = new BinaryGrid();
  private nextStableGridWithoutPlacement?: BinaryGrid;

  // the grid with the spawned piece in its final placement
  private stableGridWithPlacement?: BinaryGrid = new BinaryGrid();

  // the type of the next piece
  private nextPieceType?: TetrominoType;

  constructor(private debug: GameDebugService) {}

  // return [result, linesCleared]
  private doesMinoCountSuggestPieceSpawn(currentMinoCount: number): [MinoResult, number] {

    console.log("Count:", currentMinoCount);
    console.log("Last Stable Count:", this.lastStableMinoCount);

    // +4 minos, suggests that a piece has spawned without a line clear
    if (currentMinoCount === this.lastStableMinoCount + 4) return [MinoResult.SPAWN, 0];

    // -6/-16/-26/-36 minos, suggests that a piece has spawned after a line clear
    if (currentMinoCount === this.lastStableMinoCount - 6) return [MinoResult.SPAWN, 1];
    if (currentMinoCount === this.lastStableMinoCount - 16) return [MinoResult.SPAWN, 2];
    if (currentMinoCount === this.lastStableMinoCount - 26) return [MinoResult.SPAWN, 3];
    if (currentMinoCount === this.lastStableMinoCount - 36) return [MinoResult.SPAWN, 4];

    // if mino count is the same, then no change
    if (currentMinoCount === this.lastStableMinoCount) return [MinoResult.NO_CHANGE, -1];

    // otherwise, we are in limbo because we're not sure what's happening
    return [MinoResult.LIMBO, -1];
  }

  // If new piece has spawned, return the grid without and with previous piece
  // otherwise, return undefined
  public processFrame(currentGrid: BinaryGrid, nextPieceType?: TetrominoType): [MinoResult, SpawnData | undefined] {
    console.log("NEW FRAME");
    currentGrid.print();
    const currentMinoCount = currentGrid.count();
    const [result, linesCleared] = this.doesMinoCountSuggestPieceSpawn(currentMinoCount);
    this.debug.log(`Current mino count: ${currentMinoCount}, Last Stable Mino Count: ${this.lastStableMinoCount}`);
    this.debug.log(`Result: ${result}, Lines Cleared:, ${linesCleared}`);

    // if there might be a piece spawn, try to isolate the spawned piece
    // this should also trigger the first frame of the game where the spawned piece is fully visible
    if (result === MinoResult.SPAWN) {
      const spawnedMinos = findFourConnectedComponent(currentGrid);
      this.debug.log(`Spawned minos: ${spawnedMinos?.map(({ x, y }) => `(${x}, ${y})`).join(", ")})`);

      if (spawnedMinos === null && linesCleared > 0) {
        // if we can't isolate the spawned piece, then either the capture accidentally captured four extra minos,
        // or the new piece is temporarily overlapping with other minos in the board.
        // HOWEVER, THIS ONLY MATTERS WHEN THERE'S A LINE CLEAR
        // Without a line clear, simply rollback to previous stable mino count grid to get the grid without placement
        // either way, we skip this frame and wait for a frame where the new piece is isolated
        this.debug.log("Although SPAWN detected, Cannot isolate spawned piece and lines were cleared, skipping frame");
        return [MinoResult.NO_CHANGE, undefined];
      } else {


        // if we CAN isolate the spawned piece, then we can assume that the new piece has spawned

        // update mino count
        this.lastStableMinoCount = currentMinoCount;

        // cache last stable grid without placement
        this.lastStableGridWithoutPlacement = this.nextStableGridWithoutPlacement;

        if (linesCleared > 0) {
          // we can't simply use the last stable grid with placement because the line clear would have removed minos
          // instead, we can derive what the grid looks like without the spawned piece by removing the minos of the spawned piece from current grid
          this.nextStableGridWithoutPlacement = currentGrid.copy();
          spawnedMinos!.forEach(({ x, y }) => this.nextStableGridWithoutPlacement!.setAt(x, y, BlockType.EMPTY));
          this.debug.log("Lines cleared, set nextStableGridWithoutPlacement by removing spawned minos from current grid")
        } else {
          // if no lines were cleared, we can just use the last stableGridWithPlacement
          this.nextStableGridWithoutPlacement = this.stableGridWithPlacement!.copy();
          this.debug.log("No lines cleared, set nextStableGridWithoutPlacement by copying previous stableGridWithPlacement")
        }
        

        // no previous placement to register if this is the first spawned piece
        if (this.lastStableGridWithoutPlacement === undefined) {
          this.debug.log("First piece spawned, no previous placement to register");
          return [MinoResult.NO_CHANGE, undefined];
        }

        this.debug.logGrid("Last Stable Grid Without Placement", this.lastStableGridWithoutPlacement);
        this.debug.logGrid("Stable Grid With Placement", this.stableGridWithPlacement);
        this.debug.logGrid("Next Stable Grid Without Placement", this.nextStableGridWithoutPlacement);
        return [MinoResult.SPAWN, new SpawnData(this.lastStableGridWithoutPlacement, this.stableGridWithPlacement, this.nextPieceType, linesCleared)];
      }
    } else if (result === MinoResult.NO_CHANGE) {
      // if there was no change in minos, the piece is still falling. Update the lastStableGridWithPlacement to this frame
      this.stableGridWithPlacement = currentGrid.copy();
      this.debug.logGrid("Stable Grid With Placement updated", this.stableGridWithPlacement);

      // keep polling next box to overwrite possibly bad previous next box values
      if (nextPieceType !== undefined) this.nextPieceType = nextPieceType;

      return [MinoResult.NO_CHANGE, undefined];
    } else { // result === MinoResult.LIMBO
      // if in limbo, then we skip this frame
      this.debug.log("Unstable mino count");
      return [MinoResult.NO_CHANGE, undefined];
    }
  }
}
  

@Injectable({
  providedIn: 'root'
})
export class GameStateMachineService {

  private playCalibratePage: PlayCalibratePage = PlayCalibratePage.PLAY;
  private playStatus: PlayStatus = PlayStatus.NOT_PLAYING;

  private gameStartLevel: number = 0;
  private currentGameStatus?: SmartGameStatus;

  // handles mino changes / new piece detection
  private gridSM?: GridStateMachine = undefined;

  // all the placements for the current game
  private placements: GamePlacement[] = [];

  // how many times a completely invalid frame has been detected consecutively
  private invalidFrameCount = 0;
  private readonly MAX_INVALID_FRAMES = 20; // if this many invalid frames in a row, end game

  // how many times successfully game start detection has been detected consecutively
  private gameStartDetectionCount = 0;
  private readonly MIN_GAME_START_DETECTION = 10; // if this many game start detections in a row, start game

  constructor(
    private extractedStateService: ExtractedStateService,
    private debug: GameDebugService,
    ) { }

  public startGame(): void {
    console.log("Starting game");
    this.gridSM = new GridStateMachine(this.debug);
    this.playStatus = PlayStatus.PLAYING;
    this.placements = []; // clear placements
    this.debug.resetNewGame();
    this.gameStartLevel = this.extractedStateService.get().getStatus().level;
    this.currentGameStatus = new SmartGameStatus(this.gameStartLevel); // reset game level/lines/score
  }

  public endGame(): void {
    console.log("Ending game");
    this.gridSM = undefined;
    this.playStatus = PlayStatus.NOT_PLAYING;
  }

  // executes once per frame to update state machine. Main method for this class
  public tick(): void {

    const state = this.extractedStateService.get();

    if (this.playStatus === PlayStatus.NOT_PLAYING) {

      // in calibrate page, cannot start game
      if (this.playCalibratePage === PlayCalibratePage.CALIBRATE) {
        return
      }

      // if game start detected, then start game
      if (this.detectGameStart(state)) {
        this.gameStartDetectionCount++;
        console.log(`Game Start Detection (${this.gameStartDetectionCount})`);
        if (this.gameStartDetectionCount >= this.MIN_GAME_START_DETECTION) {
          this.startGame();
          console.log("Game start fully detected. Starting game");
        }
        return;
      } else {
        if (this.gameStartDetectionCount > 0) console.log("Game Start Detection failed. Resetting");
        this.gameStartDetectionCount = 0;
      }

    } else if (this.playStatus === PlayStatus.PLAYING) {

      // If user switched to calibrate page, end game
      if (this.playCalibratePage === PlayCalibratePage.CALIBRATE) {
        console.log("Ended game due to user switch to calibrate page");
        this.endGame();
        return
      }
      
      // if paused, do nothing
      if (state.getPaused()) {
        return;
      }

      this.debug.addFrame(state.getGrid(), state.getNextPieceType());
      
      // if both level and next box have invalid states, this is an invalid frame
      if (state.getNextPieceType() === undefined) {
        this.invalidFrameCount++;
        this.debug.log(`Invalid Frame (${this.invalidFrameCount})`);

        // if MAX_INVALID_FRAMES invalid frames in a row, end game
        if (this.invalidFrameCount >= this.MAX_INVALID_FRAMES) {
          this.debug.log(`Ended game due to ${this.MAX_INVALID_FRAMES} invalid frames in a row`);
          this.endGame();
        }

        // do not process invalid frame
        return;

      } else {
        this.invalidFrameCount = 0;
      }

      // otherwise, process grid for mino changes and spawned piece detection
      // result is undefined if no piece spawn detected, or [gridWithoutPlacement, gridWithPlacement] if piece spawn detected
      const [minoResult, data] = this.gridSM!.processFrame(state.getGrid(), state.getNextPieceType());

      if (minoResult === MinoResult.SPAWN) {

        // if piece spawn, generate a new game placement
        const newPlacement = this.runGamePlacement(data!);
        
        // if placement is invalid, exit game due to invalid state
        if (newPlacement === undefined) {
          this.debug.log("Ended game due to invalid placement state");
          this.endGame();
          return;
        }

        // Otherwise, append placement to placements
        this.placements.push(newPlacement);
        this.debug.setPlacement(newPlacement);
        this.debug.log(`NEW PLACEMENT  ${newPlacement.status} ${newPlacement.nextPieceType}`);
      }
      
    }

  }

  // detected level can only be at or one higher than current level
  private isInvalidLevel(detectedLevel: number): boolean {
    const currentLevel = this.currentGameStatus!.level;
    return detectedLevel !== currentLevel && detectedLevel !== currentLevel + 1;
  }

  // return a new GamePlacement object encapsulating the previous placement's data, then update game state like score
  // return undefined if the placement is invalid
  private runGamePlacement(data: SpawnData): GamePlacement | undefined {

    if (data.gridWithoutPlacement === undefined) {
      console.log("Error: gridWithoutPlacement is undefined");
      return undefined;
    }

    if (data.gridWithPlacement === undefined) {
      console.log("Error: gridWithPlacement is undefined");
      return undefined;
    }

    if (data.nextPieceType === undefined) {
      console.log("Error: nextPieceType is undefined");
      return undefined;
    }

    if (data.linesCleared === undefined || data.linesCleared < 0 || data.linesCleared > 4) {
      console.log("Error: linesCleared is not valid:", data.linesCleared);
      return undefined;
    }

    // find the piece type, orientation, and position for the placed piece
    const piece = MoveableTetromino.computeMoveableTetronimo(this.debug, data.gridWithoutPlacement, data.gridWithPlacement, this.getCurrentPieceType());

    // if cannot find piece, then the placement is invalid
    if (piece === undefined) {
      console.log("Error: cannot determine placed piece");
      return undefined;
    }

    // create new game placement
    const newPlacement = new GamePlacement(
      this.currentGameStatus!.copy(),
      data.gridWithoutPlacement,
      piece,
      data.nextPieceType
    );

    // update score/level/lines after placement
    if (data.linesCleared > 0) {
      this.currentGameStatus!.onLineClear(data.linesCleared);
    }
    
    return newPlacement;

  }

  // assuming it was previously not playing, check for game start conditions:
  // 1. Board has 4 minos
  // 2. Next piece is valid
  private detectGameStart(state: ExtractedState): boolean {
    if (state.getGrid().count() !== 4) return false;
    if (state.getNextPieceType() === undefined) return false;
    return true;
  }

  public getGameStatus(): PlayStatus {
    return this.playStatus;
  }

  public getGameStartLevel(): number {
    return this.gameStartLevel;
  }

  public getCurrentGameStatus(): IGameStatus | undefined {
    return this.currentGameStatus;
  }

  public getPlayCalibratePage(): PlayCalibratePage {
    return this.playCalibratePage;
  }

  public setPlayCalibratePage(page: PlayCalibratePage): void {
    this.playCalibratePage = page;
  }

  public getMostRecentPlacement(): GamePlacement | undefined {
    if (this.placements.length === 0) return undefined;
    return this.placements[this.placements.length - 1];
  }

  // obtain the current piece as the next piece of last placement
  public getCurrentPieceType(): TetrominoType | undefined {
    return this.getMostRecentPlacement()?.nextPieceType;
  }
}
