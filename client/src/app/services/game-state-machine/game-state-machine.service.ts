import { Injectable } from '@angular/core';
import { ExtractedStateService } from '../capture/extracted-state.service';
import { ExtractedState } from '../../models/capture-models/extracted-state';
import BinaryGrid, { BlockType } from '../../models/tetronimo-models/binary-grid';
import { GamePlacement } from '../../models/game-models/game-placement';
import { findConnectedComponent } from '../../scripts/connected-components';
import { IGameStatus } from '../../models/tetronimo-models/game-status';
import MoveableTetromino from '../../models/game-models/moveable-tetromino';
import { TetrominoType } from '../../models/tetronimo-models/tetromino';
import { SmartGameStatus } from '../../models/tetronimo-models/smart-game-status';
import { Grid } from 'blockly';
import DebugFrame from '../../models/capture-models/debug-frame';
import { GameDebugService } from '../game-debug.service';
import { Game } from '../../models/game-models/game';
import { Binary } from '@angular/compiler';
import { max } from 'rxjs';
import { line } from 'core/utils/svg_paths';

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
  LIMBO = "LIMBO", // some intermediate frame where a line clear is still happening, or capture is bad this frame
  FIRST_PIECE_SPAWN = "FIRST_PIECE_SPAWN" // first piece spawn of the game
}

class SpawnData {
  constructor(
    public spawnedPieceType: TetrominoType, // can derive piece type of spawned piece
    public nextPieceType: TetrominoType, // piece type of the next box AFTER piece spawn
    public linesCleared: number,
    public previousPieceType?: TetrominoType, // piece type of the previous placement
    public lastStableGridWithoutPlacement?: BinaryGrid,
    public stableGridWithPlacement?: BinaryGrid,
    public nextStableGridWithoutPlacement?: BinaryGrid,
  ) {}
}


/*
State machine with a lifetime of the duration of a game
Stores the last stable mino count, and can imply state changes when mino count changes
*/
class GridStateMachine {

  // "stable" means the last placement frame, or before the very first frame of the game
  private lastStableMinoCount = 0;

  // "unstable" means previous DIFFERENT mino count
  // we store this specifically for the use case where the mino count is decreasing
  // but the mino count suggests a piece spawn. Here, this is a false alarm, as it could
  // also indicate that a line clear is happening
  private lastUnstableMinoCount = 0;
  private minoDirection = true; // positive if increasing, negative if decreasing

  // the grid right after a spawned piece with the spawned piece masked out
  private lastStableGridWithoutPlacement?: BinaryGrid = new BinaryGrid();
  private nextStableGridWithoutPlacement?: BinaryGrid;

  // the grid with the spawned piece in its final placement
  private stableGridWithPlacement?: BinaryGrid = new BinaryGrid();

  // the type of the next piece
  private nextPieceType?: TetrominoType;
  private currentPieceType?: TetrominoType;


  constructor(private debug: GameDebugService) {}

  // return [result, linesCleared, numMinosSpawned]
  private doesMinoCountSuggestPieceSpawn(currentMinoCount: number, nextPieceType?: TetrominoType): [MinoResult, number, number] {


    // if mino count is the same, then no change
    if (currentMinoCount === this.lastStableMinoCount) return [MinoResult.NO_CHANGE, -1, -1];

    // // if mino count is decreasing, we should not look for spawn events
    // if (this.minoDirection === false && currentMinoCount < this.lastStableMinoCount) {
    //   this.debug.log("Mino count decreasing and below last stable mino count, skipping spawn detection");
    //   return [MinoResult.LIMBO, -1];
    // }

    // if next box is unreadable, then this frame is unusauble and we delay spawn detection
    if (nextPieceType === undefined) {
      this.debug.log("Next box unreadable, delaying spawn detection");
      return [MinoResult.LIMBO, -1, -1];
    }

    const diff = currentMinoCount - this.lastStableMinoCount;

    // +4 minos, suggests that a piece has spawned without a line clear
    if ([4,5,6].includes(diff)) return [MinoResult.SPAWN, 0, diff];

    // -6/-16/-26/-36 minos, suggests that a piece has spawned after a line clear
    if ([-6, -5, -4].includes(diff)) return [MinoResult.SPAWN, 1, diff+10];
    if ([-16, -15, -14].includes(diff)) return [MinoResult.SPAWN, 2, diff+20];
    if ([-26, -25, -24].includes(diff)) return [MinoResult.SPAWN, 3, diff+30];
    if ([-36, -35, -34].includes(diff)) return [MinoResult.SPAWN, 4, diff+40];

    // otherwise, we are in limbo because we're not sure what's happening
    return [MinoResult.LIMBO, -1, -1];
  }

  private isFirstPlacement(): boolean {
    return this.lastStableGridWithoutPlacement === undefined;
  }

  // If new piece has spawned, return the grid without and with previous piece
  // otherwise, return undefined
  public processFrame(currentGrid: BinaryGrid, nextPieceType?: TetrominoType): [MinoResult, SpawnData | undefined] {
    const currentMinoCount = currentGrid.count();

    if (this.lastUnstableMinoCount !== currentMinoCount) {
      this.minoDirection = currentMinoCount > this.lastUnstableMinoCount;
      this.lastUnstableMinoCount = currentMinoCount;
      this.debug.log(`Mino count changed, ${this.minoDirection ? "increasing" : "decreasing"}`);
    }

    const [result, linesCleared, numMinosSpawned] = this.doesMinoCountSuggestPieceSpawn(currentMinoCount, nextPieceType);
    this.debug.log(`Current mino count: ${currentMinoCount}, Last Stable Mino Count: ${this.lastStableMinoCount}`);
    this.debug.log(`Result: ${result}, Lines Cleared:, ${linesCleared}`);

    // if there might be a piece spawn, try to isolate the spawned piece
    // this should also trigger the first frame of the game where the spawned piece is fully visible
    if (result === MinoResult.SPAWN) {

      // At spawn frame, there is a distinction between nextPieceType and this.nextPieceType
      // this.nextPieceType should be the type of the SPAWN piece (the nextbox BEFORE the SPAWN piece)
      // nextPieceType should be the type of the NEXT box AFTER the SPAWN piece
      
      // find the spawned piece by running connected components algorithm
      // if first placement, we search entire grid for matching tetronimo
      // otherwise, we search first few rows for any connected component with matching mino count
      const maxRow = this.isFirstPlacement() ? undefined : 4;
      const spawnedMinos = findConnectedComponent(currentGrid, numMinosSpawned, maxRow);
      
      // blit spawned piece into a binary grid to be determiend as a MoveableTetronimo
      const spawnedMinosGrid = new BinaryGrid();
      if (spawnedMinos) spawnedMinos?.forEach(({ x, y }) => spawnedMinosGrid.setAt(x, y, BlockType.FILLED));
      this.debug.logGrid("Spawned Minos", spawnedMinosGrid);
  
      // determine MoveableTetronmio if it exists. If not, then we ignore this frame
      // if it's the first placement, nextPieceType is undefined so we have to check all seven tetronimo types
      // but if it's not the first placement, check if it matches the nextbox of the previous placement
      const spawnedPiece = MoveableTetromino.computeMoveableTetronimo(this.debug, spawnedMinosGrid, this.nextPieceType);


      if (this.isFirstPlacement() && spawnedPiece === undefined) {
        this.debug.log("Although SPAWN detected, for the FIRST placement spawned piece needs to be a valid tetromino type");
        return [MinoResult.NO_CHANGE, undefined];

      } else if (spawnedMinos === null) {
        this.debug.log(`Although spawn detected, detected spawn piece does not have ${numMinosSpawned} minos`);
        return [MinoResult.NO_CHANGE, undefined];

      } else {

        this.debug.log(`SPAWN detected, ${numMinosSpawned} minos`);

        // if we CAN determine the spawned piece, then we can assume that the new piece has actually spawned and it's not a capture mistsake
        const previousPieceType = this.currentPieceType;
        this.currentPieceType = this.nextPieceType;

        // update mino count
        this.lastStableMinoCount += linesCleared * (-10) + 4;

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

        const spawnPieceType = this.isFirstPlacement() ? spawnedPiece!.tetrominoType : this.currentPieceType!;

        this.debug.log(`Previous piece type: ${previousPieceType}`);
        this.debug.log(`Spawned piece type: ${spawnPieceType}`);
        this.debug.log(`Next piece type: ${nextPieceType}`);
        
        // no previous placement to register if this is the first spawned piece
        if (this.isFirstPlacement()) {
          this.debug.log("First piece spawned, no previous placement to register");
          // note it's nextPieceType, NOT this.nextPieceType, to get the actual next box piece
          return [MinoResult.FIRST_PIECE_SPAWN, new SpawnData(spawnPieceType, nextPieceType!, 0)];
        }

        this.debug.logGrid("Last Stable Grid Without Placement", this.lastStableGridWithoutPlacement);
        this.debug.logGrid("Stable Grid With Placement", this.stableGridWithPlacement);
        this.debug.logGrid("Next Stable Grid Without Placement", this.nextStableGridWithoutPlacement);
        // note it's nextPieceType, NOT this.nextPieceType, to get the actual next box piece
        return [
          MinoResult.SPAWN,
          new SpawnData(spawnPieceType, nextPieceType!, linesCleared,
            previousPieceType,
            this.lastStableGridWithoutPlacement,
            this.stableGridWithPlacement,
            this.nextStableGridWithoutPlacement
            ),
        ];
      }
    } else if (result === MinoResult.NO_CHANGE) {
      // if there was no change in minos, the piece is still falling. Update the lastStableGridWithPlacement to this frame
      this.stableGridWithPlacement = currentGrid.copy();
      this.debug.logGrid("Stable Grid With Placement updated", this.stableGridWithPlacement);

      // keep polling next box to overwrite possibly bad previous next box values
      if (nextPieceType !== undefined) {
        this.nextPieceType = nextPieceType;
        this.debug.log(`Next piece type updated: ${nextPieceType}`);
      }

      return [MinoResult.NO_CHANGE, undefined];
    } else { // result === MinoResult.LIMBO
      // if in limbo, then we skip this frame WITHOUT updating next box
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

  // handles mino changes / new piece detection
  private gridSM?: GridStateMachine = undefined;

  // the game data the state machine is writing to
  private game?: Game;

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

    this.debug.resetNewGame();

    const gameStartLevel = this.extractedStateService.get().getStatus().level;
    this.game = new Game(gameStartLevel); // create a new game that will store all the placements
  }

  public endGame(): void {
    console.log("Ending game");
    this.gridSM = undefined;
    this.playStatus = PlayStatus.NOT_PLAYING;
    // NOTE: do not set this.game to undefined, as we want to keep the game data for analysis
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
      this.debug.setStatus(this.game!.status);
      
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
      const [minoResult, spawnData] = this.gridSM!.processFrame(state.getGrid(), state.getNextPieceType());

      if (minoResult === MinoResult.FIRST_PIECE_SPAWN) {
        // if it's the first piece spawn, create the first position
        const grid = new BinaryGrid(); // first position is an empty board
        const newPlacement = this.game!.addNewPosition(
          grid,
          spawnData!.spawnedPieceType,
          spawnData!.nextPieceType
        );
        this.debug.setPlacement(newPlacement);
        this.debug.log("First piece spawned, added new position");

      } else if (minoResult === MinoResult.SPAWN) {

        // Set the placement for the last position of the game
        const placedPiece = this.extractPlacedPiece(spawnData!.lastStableGridWithoutPlacement!, spawnData!.stableGridWithPlacement!, spawnData!.previousPieceType!);
        if (placedPiece === undefined) {
          this.debug.log("Placed piece cannot be defined. Ending game due to invalid placement");
          this.endGame();
          return;
        }
        this.game!.setPlacementForLastPosition(placedPiece, spawnData!.linesCleared!);

        // Then, update level/lines/score as a result of the placement
        if (spawnData!.linesCleared > 0) {
          this.debug.setStatus(this.game!.status);
        }

        // Finally, add a new position to the game for the starting board without the spawned piece
        const newPlacement = this.game!.addNewPosition(
          spawnData!.nextStableGridWithoutPlacement!,
          spawnData!.spawnedPieceType,
          spawnData!.nextPieceType
        );
        this.debug.setPlacement(newPlacement);
        this.debug.log("Set placement for last position, and added new position");

      }
      
    }

  }


  // Given spawn data, compare lastStableGridWithoutPlacement with stableGridWithPlacement
  // to determine where the piece was placed. return undefined if the placed piece is invalid
  private extractPlacedPiece(lastStableGridWithoutPlacement: BinaryGrid, stableGridWithPlacement: BinaryGrid, pieceType: TetrominoType): MoveableTetromino | undefined {

    // subtract to get piece mask
    const pieceMask = BinaryGrid.subtract(stableGridWithPlacement, lastStableGridWithoutPlacement);
    if (pieceMask === undefined) {
      this.debug.log("Could not subtract lastStableGridWithoutPlacement from stableGridWithPlacement to extract piece mask");
      return undefined;
    }

    this.debug.logGrid("Piece Mask", pieceMask);
    const piece = MoveableTetromino.computeMoveableTetronimo(this.debug, pieceMask, pieceType);

    if (piece === undefined) {
      this.debug.log(`Could not determine piece from piece mask, expecting type ${pieceType}`);
      return undefined;
    }

    return piece;

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
    return this.game!.startLevel;
  }

  public getCurrentGameStatus(): SmartGameStatus | undefined {
    return this.game!.status;
  }

  public getPlayCalibratePage(): PlayCalibratePage {
    return this.playCalibratePage;
  }

  public setPlayCalibratePage(page: PlayCalibratePage): void {
    this.playCalibratePage = page;
  }

  public getLastPlacement(): GamePlacement | undefined {
    return this.game?.getLastPlacement();
  }

  public getLastPosition(): GamePlacement | undefined {
    return this.game?.getLastPosition();
  }

  public getGame(): Game | undefined {
    return this.game;
  }

  // obtain the current piece as the next piece of last placement
  public getCurrentPieceType(): TetrominoType | undefined {
    return this.getLastPlacement()?.nextPieceType;
  }
}
