import { Injectable } from '@angular/core';
import { ExtractedStateService } from '../capture/extracted-state.service';
import { ExtractedState } from '../../models/capture-models/extracted-state';
import BinaryGrid, { BlockType } from '../../models/tetronimo-models/binary-grid';
import { GamePlacement } from '../../models/game-models/game-placement';
import { findConnectedComponent } from '../../scripts/connected-components';
import MoveableTetromino from '../../models/game-models/moveable-tetromino';
import { TetrominoType } from '../../models/tetronimo-models/tetromino';
import { SmartGameStatus } from '../../models/tetronimo-models/smart-game-status';
import { GameDebugService } from '../game-debug.service';
import { Game } from '../../models/game-models/game';
import { CaptureSettingsService } from '../capture/capture-settings.service';
import { GameSessionHistoryService } from '../game-session-history.service';
import { HistoricalGame } from '../../models/game-models/game-session-history';
import { Point } from '../../models/capture-models/point';
import { first } from 'rxjs';
import { GameExportService } from '../game-export.service';
import { NotifierService } from 'angular-notifier';
import { GameCacheService } from '../game-cache.service';
import { GameHistoryCacheService } from '../game-history-cache.service';
import { GameSpeed } from '../../models/evaluation-models/rating';
import { UserService } from '../user.service';
import { LeaderboardAccuracyCacheService } from '../leaderboard-accuracy-cache.service';
import { LeaderboardType } from 'server/database/leaderboard/leaderboard-schema';

/*
Handles the game lifecycle, from starting the game, processing each piece placement,
and ending the game.
*/

export enum PlayStatus {
  PLAYING = "PLAYING",
  NOT_PLAYING = "NOT_PLAYING"
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

  private getSpawnedMinosAsGrid(minos: Point[] | null): BinaryGrid {
    const spawnedMinosGrid = new BinaryGrid();
    if (minos) minos.forEach(({ x, y }) => spawnedMinosGrid.setAt(x, y, BlockType.FILLED));
    return spawnedMinosGrid;
  }

  // If new piece has spawned, return the grid without and with previous piece
  // otherwise, return undefined
  public processFrame(isFirstPlacement: boolean, currentLevel: number, currentGrid: BinaryGrid, nextPieceType?: TetrominoType): [MinoResult, SpawnData | undefined] {
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


      let spawnedMinos: Point[] | null = null;
      let spawnedMinosGrid: BinaryGrid;
      let spawnedPiece: MoveableTetromino | undefined = undefined;

      if (linesCleared === 0) {
        // if no line clears, find spawned minos by removing last stable grid from current grid
        spawnedMinosGrid = BinaryGrid.subtract(currentGrid, this.stableGridWithPlacement!) ?? new BinaryGrid();

        // for each filled mino in spawned minos grid, add to spawnedMinos list
        spawnedMinos = [];
        for (let x = 0; x < spawnedMinosGrid.numCols; x++) {
          for (let y = 0; y < spawnedMinosGrid.numRows; y++) {
            if (spawnedMinosGrid.at(x, y) === BlockType.FILLED) spawnedMinos.push({ x, y });
          }
        }

        this.debug.log("Since no line clear, we find spawned minos by subtracting last stable grid from current grid");

      } else {
        // find the spawned piece by running connected components algorithm
        // if first placement, we search entire grid for matching tetronimo
        // otherwise, we search first few rows for any connected component with matching mino count
        const topRows = currentLevel >= 29 ? 8 : (currentLevel >= 19 ? 7 : 6)
        spawnedMinos = findConnectedComponent(currentGrid, numMinosSpawned, isFirstPlacement ? undefined : topRows);
        spawnedMinosGrid = this.getSpawnedMinosAsGrid(spawnedMinos);
        
        if (spawnedMinos === null) {
          this.debug.log("Finding CC on top rows failed.");
        } else {
          this.debug.log(`Finding CC on top rows succeeded.`);
        }
      }

      // see if we can determine the spawned piece type
      spawnedPiece = MoveableTetromino.computeMoveableTetronimo(this.debug, spawnedMinosGrid, this.nextPieceType);

      this.debug.logGrid("Spawned Minos", spawnedMinosGrid);
      this.debug.log(`Spawned Piece: ${spawnedPiece?.tetrominoType}`);

      if (isFirstPlacement && spawnedPiece === undefined) {
        this.debug.log("Although SPAWN detected, for the FIRST placement spawned piece needs to be a valid tetromino type");
        return [MinoResult.NO_CHANGE, undefined];

      } else if (spawnedMinosGrid.count() !== numMinosSpawned) {
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

        // we get the new start position of the board by removing the minos of the spawned piece from current grid
        this.nextStableGridWithoutPlacement = currentGrid.copy();
        spawnedMinos!.forEach(({ x, y }) => this.nextStableGridWithoutPlacement!.setAt(x, y, BlockType.EMPTY));
        this.debug.log("Lines cleared, set nextStableGridWithoutPlacement by removing spawned minos from current grid")

        const spawnPieceType = isFirstPlacement ? spawnedPiece!.tetrominoType : this.currentPieceType!;

        this.debug.log(`Previous piece type: ${previousPieceType}`);
        this.debug.log(`Spawned piece type: ${spawnPieceType}`);
        this.debug.log(`Next piece type: ${nextPieceType}`);

        // no previous placement to register if this is the first spawned piece
        if (isFirstPlacement) {
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

  private playStatus: PlayStatus = PlayStatus.NOT_PLAYING;
  private canPlayGame: boolean = false;

  // handles mino changes / new piece detection
  private gridSM?: GridStateMachine = undefined;

  // the game data the state machine is writing to
  private game?: Game;

  // how many times a completely invalid frame has been detected consecutively
  private invalidFrameCount = 0;
  private readonly MAX_INVALID_FRAMES = 8; // if this many invalid frames in a row, end game

  // how many times successfully game start detection has been detected consecutively
  private gameStartDetectionCount = 0;
  private readonly MIN_GAME_START_DETECTION = 10; // if this many game start detections in a row, start game
  
  private pauseCountInGame = 0;
  private readonly MAX_PAUSE_COUNT_IN_GAME = 10; // if this many pauses in a row, send onPause() event

  private lastGameSentToServerOrDiscarded: boolean = true;
  private sentGameCancelledMessage = false;

  constructor(
    private extractedStateService: ExtractedStateService,
    private captureSettingsService: CaptureSettingsService,
    private gameHistoryService: GameSessionHistoryService,
    private exportService: GameExportService,
    private debug: GameDebugService,
    private notifier: NotifierService,
    private gameCacheService: GameCacheService,
    private gameHistoryCacheService: GameHistoryCacheService,
    private user: UserService,
    private leaderboardCache: LeaderboardAccuracyCacheService,
    ) { }

  public startGame(): void {

    // disable this for now. means that you can start a new game while the previous game is still being sent to server
    if (false && !this.lastGameSentToServerOrDiscarded) {

      if (!this.sentGameCancelledMessage) {
        console.log("ABORTING START GAME, PREVIOUS NOT SENT");
        this.notifier.notify("error", "Game cancelled. Still trying to save the previous game to server. Check your internet! Please wait...", "ABORT_START_GAME");
        this.sentGameCancelledMessage = true;
      }

      return;
    }

    console.log("Starting game");

    this.lastGameSentToServerOrDiscarded = false;
    this.sentGameCancelledMessage = false;

    this.gridSM = new GridStateMachine(this.debug);
    this.playStatus = PlayStatus.PLAYING;

    const gameStartLevel = this.extractedStateService.get().getStatus().level;
    const inputSpeed = this.captureSettingsService.get().inputSpeed;
    this.game = new Game(gameStartLevel, inputSpeed, this.user.getUsername()!, this.captureSettingsService.get().playstyle); // create a new game that will store all the placements

    this.debug.resetNewGame(this.game.gameID);
    this.notifier.notify("success", `Game started on level ${gameStartLevel}`);

    // sync leaderboard accuracy
    this.leaderboardCache.registerGame(this.game);
    if (gameStartLevel === 29) this.leaderboardCache.syncAccuraciesWithServer(LeaderboardType.START_29);
    else if (gameStartLevel === 18 || gameStartLevel === 19) this.leaderboardCache.syncAccuraciesWithServer(LeaderboardType.OVERALL);
  }


  // go through the game and see if any placements were missed
  public analyzeMissedPlacements(game: Game, callbackAfter?: ()=>void): void {

    console.log("Analyzing missed placements");


    let gameSent: boolean = false;

    let missedPlacementsWarningID = "MISSED_PLACEMENT_ID"

    let numMissedPlacements = 0;
    let numMissedPlacementsAnalyzed = 0;
    game.getAllPlacements().forEach((placement, index) => {
      if (!placement.analysis.isAnalysisStarted()) {
        
        numMissedPlacements++;
        game.runFullAnalysis(placement);

        placement.analysis.onFinishAnalysis$.pipe(
          first(isAnalysisComplete => isAnalysisComplete)
        ).subscribe(() => {
          numMissedPlacementsAnalyzed++;
          if (numMissedPlacementsAnalyzed === numMissedPlacements) {
            this.notifier.hide(missedPlacementsWarningID);
            console.log("Finished analyzing missed placements");
            if (callbackAfter && !gameSent) {
              console.log("Sending game after analyzing missed placements")
              gameSent = true;
              callbackAfter();
            }
          }
        })
      }
    });

    if (numMissedPlacements > 0) {
      this.notifier.notify("warning", `Analysis for ${numMissedPlacements} placements were incomplete. Please wait...`, missedPlacementsWarningID);
    } else {
      console.log("No missed placements to analyze")
      gameSent = true;
      if (callbackAfter) callbackAfter();
    }

    setTimeout(() => {
      if (!gameSent) {
        this.notifier.notify("error", "Analysis for missed placements timed out. Will send game to server anyways, but be aware of incomplete analysis.");
        console.log("Sending game after analyzing missed placements timeout")
        gameSent = true;
        if (callbackAfter) callbackAfter();
      }
    }, 60000); // one minute

  }

  // this function handles pushing to game history and sending game to server once complete
  // precondition: game is fully analyzed
  public onGameFinishedAndAnalyzed(game: Game, callbackAfter?: ()=>void) {

    if (!game) throw new Error("Game is undefined");

    console.log("Game finished and analyzed");

    game.setTimestamp(new Date());

    // add to cache
    this.gameCacheService.cacheGame(game);

    // push to session game history
    const historicalGame = new HistoricalGame(
      game.getTimestamp()!,
      game.startLevel,
      game.status.score,
      game.status.level,
      game.status.lines,
      game.analysisStats.getOverallAccuracy().getAverage(),
      undefined
    )
    this.gameHistoryService.get().addGame(historicalGame);

    // push to full game history cache if it exists
    if (this.gameHistoryCacheService.hasCache()) {
      this.gameHistoryCacheService.pushGameToCache({
        timestamp: game.getTimestamp()!.toISOString(),
        gameID: game.gameID,
        startLevel: game.startLevel,
        score19: game.stats.getScoreAtTransitionTo19(),
        score29: game.stats.getScoreAtTransitionTo29(),
        finalScore: game.status.score,
        finalLevel: game.status.level,
        overallAccuracy: game.analysisStats.getOverallAccuracy().getAverage(),
        accuracy18: game.analysisStats.getSpeedAccuracy(GameSpeed.SPEED_18)?.getAverage(),
        accuracy19: game.analysisStats.getSpeedAccuracy(GameSpeed.SPEED_19)?.getAverage(),
        droughtPercent: game.stats.getPercentInDrought(),
        tetrisReadiness: game.stats.getTetrisReadiness(),
        iPieceEfficiency: game.stats.getIPieceEfficiency(),
      });
    }

    // export and send to server
    this.exportService.export(game).then(([notifyType, notifyMessage]) => {
      const accuracy = Math.round(game!.analysisStats.getOverallAccuracy().getAverage() * 10000) / 100;
      this.notifier.notify("success", `Game successfully saved with ${game!.status.score} points at ${accuracy}% accuracy.`);
      console.log("Game successfully saved");
      setTimeout(() => {
        if (notifyType !== "none") this.notifier.notify(notifyType, notifyMessage);
      }, 1000);
    });

    this.lastGameSentToServerOrDiscarded = true;

    // if callback set, call it
    if (callbackAfter) callbackAfter();

  }

  public endGame(callbackAfter?: ()=>void): void {
    console.log("Ending game");
    this.gridSM = undefined;
    this.playStatus = PlayStatus.NOT_PLAYING;
    // NOTE: do not set this.game to undefined, as we want to keep the game data for analysis

    // cache game in case this.game is reset due to a new game starting
    const endedGame = this.game;


    // if game has at least five placements, add to game history
    if (endedGame && endedGame.numPlacements >= 5) {

      let gameSent = false;

      // delete last placement if placement is undefined
      endedGame.popLastPositionIfUndefined();
      if (!endedGame.getLastPosition()!.hasPlacement()) throw new Error("Last position has no placement");

      // when last placement is finished analyzing, call onGameFinishedAndAnalyzed()
      endedGame.getLastPosition()!.analysis.onFinishAnalysis$.pipe(
        first(isAnalysisComplete => isAnalysisComplete)
      ).subscribe(() => {
        gameSent = true;
        console.log("Last placement finished analyzing");
        this.analyzeMissedPlacements(endedGame!, () => {
          this.onGameFinishedAndAnalyzed(endedGame!, callbackAfter);
        })
      });

      // after 3 seconds, check if analysis has started. if not, wifi failed. keep trying to send game
      let numRetries = 0;
      const retrySendGame = setInterval(() => {
        if (!gameSent && !endedGame!.getLastPosition()!.analysis.isAnalysisStarted()) {
          if (numRetries % 3 === 0) this.notifier.notify("error", "Connection failed. Retrying...");
          endedGame!.runFullAnalysis(endedGame!.getLastPosition()!);
        } else {
          console.log("Break out of retry loop because sent");
          clearInterval(retrySendGame);
        }
        numRetries++;
      }, 2000);

    } else {
      this.lastGameSentToServerOrDiscarded = true;
      this.sentGameCancelledMessage = false;
      this.notifier.notify("warning", "Game discarded. Games under 5 placements are not saved.")
    }

  }

  public onEnterCalibrationPage(): void {
    this.canPlayGame = false;
    if (this.playStatus === PlayStatus.PLAYING) this.endGame();
  }

  public onLeaveCalibrationPage(): void {
    this.canPlayGame = true;
  }

  // executes once per frame to update state machine. Main method for this class
  public tick(): void {

    const state = this.extractedStateService.get();

    if (this.playStatus === PlayStatus.NOT_PLAYING) {

      // if game start detected, then start game
      if (this.canPlayGame && this.detectGameStart(state)) {
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
        this.sentGameCancelledMessage = false;
      }

    } else if (this.playStatus === PlayStatus.PLAYING) {

      // if paused, do nothing
      if (state.getPaused()) {

        this.pauseCountInGame++;
        if (this.pauseCountInGame >= this.MAX_PAUSE_COUNT_IN_GAME) {
          this.game!.eligibility.onPiecePause();
        }
        return;
      } else {
        this.pauseCountInGame = 0;
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
      const currentLevel = this.game!.status.level;
      const [minoResult, spawnData] = this.gridSM!.processFrame(
        this.game?.numPlacements === 0,
        currentLevel,
        state.getGrid(),
        state.getNextPieceType()
      );

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

  public isInGame(): boolean {
    return this.playStatus === PlayStatus.PLAYING;
  }

  public getGameStartLevel(): number {
    return this.game!.startLevel;
  }

  public getCurrentGameStatus(): SmartGameStatus {
    return this.game!.status;
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
