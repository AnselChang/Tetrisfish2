import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { CaptureSettingsService } from 'client/src/app/services/capture/capture-settings.service';
import { CaptureFrameService, CaptureMode } from 'client/src/app/services/capture/capture-frame.service';
import { ExtractedState } from 'client/src/app/models/capture-models/extracted-state';
import { ExtractedStateService } from 'client/src/app/services/capture/extracted-state.service';
import { VideoCaptureService } from 'client/src/app/services/capture/video-capture.service';
import { GameStateMachineService, PlayStatus } from 'client/src/app/services/game-state-machine/game-state-machine.service';
import { TEXT_GREEN, TEXT_RED } from 'client/src/app/misc/colors';
import BinaryGrid from 'client/src/app/models/tetronimo-models/binary-grid';
import { GamePlacement } from 'client/src/app/models/game-models/game-placement';
import MoveableTetromino from 'client/src/app/models/game-models/moveable-tetromino';
import { MoveRecommendation } from 'client/src/app/models/analysis-models/engine-movelist';
import { RateMoveDeep } from 'client/src/app/models/analysis-models/rate-move';
import { Game } from 'client/src/app/models/game-models/game';
import GameEligibility from 'client/src/app/models/game-models/game-eligibility';


@Component({
  selector: 'app-play-page',
  templateUrl: './play-page.component.html',
  styleUrls: ['./play-page.component.scss']
})
export class PlayPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  public videoElement!: ElementRef<HTMLVideoElement>;

  
  public showBoundingBoxes: boolean = true;
  public showMinoIndicators: boolean = true;


  // eligibility when not in game
  private readonly defaultEligibility = new GameEligibility(-1);

  constructor(
    public videoCaptureService: VideoCaptureService,
    public extractedStateService: ExtractedStateService,
    public captureSettingsService: CaptureSettingsService,
    private gameStateMachineService: GameStateMachineService,
    private captureFrameService: CaptureFrameService
    ) {
 
  }

  ngAfterViewInit(): void {
    this.videoElement = this.videoCaptureService.getVideoElement();
    this.videoCaptureService.registerCanvas(this.canvasElement, true);
    this.videoCaptureService.onEnterPlayPage();
  }

  ngOnDestroy(): void {
      this.videoCaptureService.onLeavePlayPage();
  }


  public get extractedState() {
    return this.extractedStateService.get();
  }

  public get settings() {
    return this.captureSettingsService.get();
  }

  public get game(): Game | undefined {
    return this.gameStateMachineService.getGame();
  }

  public getScoreString(): string | number {
    const status = this.gameStateMachineService.getCurrentGameStatus();
    return status ? status.score : "N/A";
  }

  public getLevelString(): string | number {
    const status = this.gameStateMachineService.getCurrentGameStatus();
    return status ? status.level : "N/A";
  }

  public getLinesString(): string | number {
    const status = this.gameStateMachineService.getCurrentGameStatus();
    return status ? status.lines : "N/A";
  }

  public isInGame(): boolean {
    return this.gameStateMachineService.getGameStatus() === PlayStatus.PLAYING;
  }

  public determineBoundingBoxes(event: Event) {
    console.log("determineBoundingBoxes");
    if (this.captureFrameService.hasFrame()) {
      event.stopPropagation();
      this.captureFrameService.mode$.next(CaptureMode.CLICK_ON_BOARD);
    }
  }

  public getThresholdString(): string {
    const threshold = this.settings.threshold;
    if (threshold < 10) return " " + threshold;
    else return "" + threshold;
  }

  public getStatusString(): string {
    if (this.isInGame()) {
      const startLevel = this.gameStateMachineService.getGameStartLevel();
      return `Playing Level ${startLevel} Start`;
    }
    else return "Not Playing";
  }

  public getStatusColor(): string {
    return this.isInGame() ? TEXT_GREEN : TEXT_RED;
  }

  public getLastPosition(): GamePlacement | undefined {
    return this.gameStateMachineService.getLastPosition();
  }

  public getLastPlacement(): GamePlacement | undefined {
    return this.gameStateMachineService.getLastPlacement();
  }

  public getBestMove(): MoveRecommendation | undefined {
    return this.getLastPlacement()?.analysis.getEngineMoveListNB()?.best;
  }

  public getMoveRating(): RateMoveDeep | undefined {

    const lastPlacement = this.getLastPlacement();
    if (!lastPlacement) return undefined;
    
    // if SR has got back with player rating, return it
    const rating = lastPlacement?.analysis.getRateMoveDeep();
    if (rating) return rating;

    // otherwise, check if player move is in SR move recommendations
    // If so, we can derive rating from that
    const engineMovelistNB = lastPlacement?.analysis.getEngineMoveListNB();
    const recommendations = engineMovelistNB?.getRecommendations();
    if (recommendations) {
      for (const recommendation of recommendations) {
        if (recommendation.thisPiece.equals(lastPlacement.piecePlacement!)) {
          return new RateMoveDeep({
            playerMoveNoAdjustment: -1,
            playerMoveAfterAdjustment: recommendation.evaluation,
            bestMoveNoAdjustment: -1,
            bestMoveAfterAdjustment: engineMovelistNB!.best.evaluation,
          });
        }
      }
    }

    return undefined;
  }

  public getAccuracyColor(accuracy: number): string {
    return "white";
  }

  public getEligibility(): GameEligibility {
    return this.gameStateMachineService.getGame()?.eligibility ?? this.defaultEligibility;
  }
}
