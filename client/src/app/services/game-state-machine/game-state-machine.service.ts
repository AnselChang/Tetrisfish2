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

/*
Handles the game lifecycle, from starting the game, processing each piece placement,
and ending the game.
*/

export enum PlayStatus {
  PLAYING = "PLAYING",
  LIMBO = "LIMBO",
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

// a class that stores the last stable mino count, and can imply state changes when mino count changes
class GridStateMachine {

  // "stable" means the last placement frame, or before the very first frame of the game
  private lastStableMinoCount = 0;

  // the grid right after a spawned piece with the spawned piece masked out
  private lastStableGridWithoutPlacement?: BinaryGrid = new BinaryGrid();
  private nextStableGridWithoutPlacement?: BinaryGrid;

  // the grid with the spawned piece in its final placement
  private stableGridWithPlacement?: BinaryGrid;

  // the type of the next piece
  private nextPieceType?: TetrominoType;

  // return [result, linesCleared]
  private doesMinoCountSuggestPieceSpawn(currentMinoCount: number): [MinoResult, number] {

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
  public processFrame(currentGrid: BinaryGrid, nextPieceType?: TetrominoType): [BinaryGrid?, BinaryGrid?, TetrominoType?, number?] | undefined {

    const currentMinoCount = currentGrid.count();
    const [result, linesCleared] = this.doesMinoCountSuggestPieceSpawn(currentMinoCount);

    // if there might be a piece spawn, try to isolate the spawned piece
    // this should also trigger the first frame of the game where the spawned piece is fully visible
    if (result === MinoResult.SPAWN) {
      const spawnedMinos = findFourConnectedComponent(currentGrid);

      if (spawnedMinos === null) {
        // if we can't isolate the spawned piece, then either the capture accidentally captured four extra minos,
        // or the new piece is temporarily overlapping with other minos in the board.
        // either way, we skip this frame and wait for a frame where the new piece is isolated
        return undefined;
      } else {


        // if we CAN isolate the spawned piece, then we can assume that the new piece has spawned
        // we can derive what the grid looks like without the spawned piece by removing the minos of the spawned piece from current grid
        this.lastStableGridWithoutPlacement = this.nextStableGridWithoutPlacement;
        this.nextStableGridWithoutPlacement = currentGrid.copy();
        spawnedMinos.forEach(({ x, y }) => this.nextStableGridWithoutPlacement!.setAt(x, y, BlockType.EMPTY));
        
        // no previous placement to register if this is the first spawned piece
        if (this.lastStableGridWithoutPlacement === undefined) return undefined;

        return [this.lastStableGridWithoutPlacement, this.stableGridWithPlacement, this.nextPieceType, linesCleared];
      }
    } else if (result === MinoResult.NO_CHANGE) {
      // if there was no change in minos, the piece is still falling. Update the lastStableGridWithPlacement to this frame
      this.stableGridWithPlacement = currentGrid.copy();

      // keep polling next box to overwrite possibly bad previous next box values
      if (nextPieceType !== undefined) this.nextPieceType = nextPieceType;

      return undefined;
    } else { // result === MinoResult.LIMBO
      // if in limbo, then we skip this frame
      return undefined;
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
  private gridSM = new GridStateMachine();

  // all the placements for the current game
  private placements: GamePlacement[] = [];

  constructor(private extractedStateService: ExtractedStateService) { }

  public startGame(): void {
    this.playStatus = PlayStatus.PLAYING;
    this.placements = []; // clear placements
    this.gameStartLevel = this.extractedStateService.get().getStatus().level;
    this.currentGameStatus = new SmartGameStatus(this.gameStartLevel); // reset game level/lines/score
  }

  public endGame(): void {
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
        console.log("Started game due to game start detection");
        this.startGame();
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

      // otherwise, process grid for mino changes and spawned piece detection
      // result is undefined if no piece spawn detected, or [gridWithoutPlacement, gridWithPlacement] if piece spawn detected
      const result = this.gridSM.processFrame(state.getGrid(), state.getNextPieceType());

      // if no piece spawn, do nothing
      if (result === undefined) {
        return;
      }

      // if piece spawn, generate a new game placement
      const newPlacement = this.runGamePlacement(result[0], result[1], result[2], result[3]);
      
      // if placement is invalid, exit game due to invalid state
      if (newPlacement === undefined) {
        console.log("Ended game due to invalid placement state");
        this.endGame();
        return;
      }

      // Otherwise, append placement to placements
      this.placements.push(newPlacement);
    }

  }

  // return a new GamePlacement object encapsulating the previous placement's data, then update game state like score
  // return undefined if the placement is invalid
  private runGamePlacement(gridWithoutPlacement?: BinaryGrid, gridWithPlacement?: BinaryGrid, nextPieceType?: TetrominoType, linesCleared?: number): GamePlacement | undefined {

    if (gridWithoutPlacement === undefined) {
      console.log("Error: gridWithoutPlacement is undefined");
      return undefined;
    }

    if (gridWithPlacement === undefined) {
      console.log("Error: gridWithPlacement is undefined");
      return undefined;
    }

    if (nextPieceType === undefined) {
      console.log("Error: nextPieceType is undefined");
      return undefined;
    }

    if (linesCleared === undefined || linesCleared < 0 || linesCleared > 4) {
      console.log("Error: linesCleared is not valid:", linesCleared);
      return undefined;
    }

    // find the piece type, orientation, and position for the placed piece
    const piece = MoveableTetromino.computeMoveableTetronimo(gridWithoutPlacement, gridWithPlacement);

    // if cannot find piece, then the placement is invalid
    if (piece === undefined) {
      console.log("Error: cannot determine placed piece");
      return undefined;
    }

    // create new game placement
    const newPlacement = new GamePlacement(
      this.currentGameStatus!.copy(),
      gridWithoutPlacement,
      piece,
      nextPieceType
    );

    // update score/level/lines after placement
    if (linesCleared > 0) {
      this.currentGameStatus!.onLineClear(linesCleared);
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

}
