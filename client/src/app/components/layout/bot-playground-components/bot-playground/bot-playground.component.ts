import { Component, HostListener } from '@angular/core';
import { AbstractAIAdapter } from 'client/src/app/ai/abstract-ai-adapter/abstract-ai-adapter';
import { BestMoveResponse } from 'client/src/app/ai/abstract-ai-adapter/best-move-response';
import { ADAPTER_MAP, ALL_ADAPTER_TYPES } from 'client/src/app/ai/ai-adapters/all-adapters';
import { BotConfig } from 'client/src/app/ai/bot-config';
import { RNG_MAP } from 'client/src/app/ai/piece-sequence-generation/all-rng';
import { RandomRNG } from 'client/src/app/ai/piece-sequence-generation/random-rng';
import { AISimulation } from 'client/src/app/ai/simulation/ai-simulation';
import { AISimulationStats, StatLevel, StatsForLevel } from 'client/src/app/ai/simulation/ai-simulation-stats';
import { SimulationState } from 'client/src/app/ai/simulation/simulation-state';
import { Metric } from 'client/src/app/models/metric';
import { TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';
import { ALL_INPUT_SPEEDS } from 'client/src/app/scripts/evaluation/input-frame-timeline';

@Component({
  selector: 'app-bot-playground',
  templateUrl: './bot-playground.component.html',
  styleUrls: ['./bot-playground.component.scss']
})
export class BotPlaygroundComponent {

  // placementIndex is simulation.placements[placementIndex].stateBefore
  // placementIndex+1 is simulation.placements[placementIndex].stateAfter
  public placementIndex: number = 0;
  public playing: boolean = false;

  private playingLoopID?: any;

  // the settings of the current bot
  public botConfig = new BotConfig(); 

  simulation!: AISimulation;
  stats!: AISimulationStats;

  private loggedToppedOutGame: boolean = false;

  readonly ALL_ADAPTER_TYPES = ALL_ADAPTER_TYPES;
  readonly ALL_INPUT_SPEEDS = ALL_INPUT_SPEEDS;
  readonly ALL_START_LEVELS = [18, 19, 29];

  readonly averageFunc = (m: Metric) => m.getAverage();
  readonly medianFunc = (m: Metric) => m.getMedian();
  readonly bestFunc = (m: Metric) => m.getBest();
  readonly worstFunc = (m: Metric) => m.getWorst();

  constructor() {
    this.resetGame();
  }

  onAITypeChange() {

    // if variant does not exist, set to first variant
    if (!this.getSelectedAI().getVariants().includes(this.botConfig.variant)) {
      this.botConfig.variant = this.getSelectedAI().getVariants()[0];
    }

    this.resetGame();
  }


  resetGame() {
    this.stopGame();
    this.placementIndex = 0;
    const rng = RNG_MAP[this.botConfig.rngType];
    this.simulation = new AISimulation(this.getSelectedAI(), this.botConfig.variant, rng, this.botConfig.startLevel, this.botConfig.inputSpeed, this.botConfig.reactionTimeFrames);
    this.stats = new AISimulationStats();
    this.loggedToppedOutGame = false;
  }

  startGame() {
    this.playing = true;

    // keep going to the next placement until game ends or stopGame() is called
    this.playingLoopID = setInterval(async () => {
      await this.goToNextPlacement();
    }, 10);
  }
  
  stopGame() {
    this.playing = false;
    clearInterval(this.playingLoopID);
  }

  goToPreviousPlacement() {
    this.placementIndex = Math.max(0, this.placementIndex - 1);
  }

  // add game stats
  private onTopOutGame() {
    this.stats
  }

  // if the no new placements in cache, simulate new one
  async goToNextPlacement() {

    if (this.simulation.isSimulating()) return;

    if (this.placementIndex === this.simulation.getNumPlacements()) {
      const success = await this.simulation.simulateOnePlacement();
      if (!success) {
        this.stopGame();

        if (!this.loggedToppedOutGame) {
          this.onTopOutGame();
          this.loggedToppedOutGame = true;
        }

        return;
      }
    }
    this.placementIndex++;
  }

  // at placementIndex = 0, return the starting state
  // at placementIndex = N, return the state after the placement at index N-1
  getCurrentState(): SimulationState {
    if (this.placementIndex === 0) {
      return this.simulation.getStartState();
    }
    else {
      const placement = this.simulation.getPlacementAtIndex(this.placementIndex - 1).getStateBefore();
      if (placement === undefined) {
        throw new Error("State after placement not computed");
      }
      return placement;
    }
  }

  getSelectedAI(): AbstractAIAdapter {
    return ADAPTER_MAP[this.botConfig.aiType];
  }

  getCurrentPlacement(): BestMoveResponse | undefined {
    if (this.placementIndex === 0) {
      return undefined;
    }
    else {
      return this.simulation.getPlacementAtIndex(this.placementIndex - 1).getPlacement();
    }
  }

  aggregate(level: StatLevel, func: ((m: Metric) => number | undefined)): number[] | undefined {
    const stats = this.stats.statsForLevel[level];

    if (!stats.hasValues()) return undefined;

    return [
      func(stats.subscore)!,
      func(stats.tetrisRate)!,
      func(stats.rightWellOpen)!,
      func(stats.tetrisReady)!,
    ];

  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if (event.key === "ArrowLeft" || event.key === ",") {
      this.goToPreviousPlacement();
    } else if (event.key === "ArrowRight" || event.key === ".") {
      this.goToNextPlacement();
    }
  }

}
