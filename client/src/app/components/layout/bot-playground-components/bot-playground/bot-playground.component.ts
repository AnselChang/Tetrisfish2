import { Component, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractAIAdapter } from 'client/src/app/ai/abstract-ai-adapter/abstract-ai-adapter';
import { BestMoveResponse } from 'client/src/app/ai/abstract-ai-adapter/best-move-response';
import { ADAPTER_MAP, AIAdapterType, ALL_ADAPTER_TYPES } from 'client/src/app/ai/ai-adapters/all-adapters';
import { BotConfig, Linecap } from 'client/src/app/ai/bot-config';
import { RNGType, RNG_MAP } from 'client/src/app/ai/piece-sequence-generation/all-rng';
import { RandomRNG } from 'client/src/app/ai/piece-sequence-generation/random-rng';
import { AISimulation } from 'client/src/app/ai/simulation/ai-simulation';
import { AISimulationStats, StatLevel, StatsForLevel } from 'client/src/app/ai/simulation/ai-simulation-stats';
import { SimulationState } from 'client/src/app/ai/simulation/simulation-state';
import { Metric } from 'client/src/app/models/metric';
import { TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';
import { convertToEnum } from 'client/src/app/scripts/convert-to-enum';
import { ALL_INPUT_SPEEDS, InputSpeed } from 'client/src/app/scripts/evaluation/input-frame-timeline';
import { exportToCSV } from '../../ml-dataset/csv';

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
  public autoplay: boolean = false;
  public autoplayLeft: number = 0;

  private playingLoopID?: any;

  // the settings of the current bot
  public botConfig = new BotConfig(); 

  simulation!: AISimulation;
  stats!: AISimulationStats;

  public isToppedOut: boolean = false;

  readonly ALL_ADAPTER_TYPES = ALL_ADAPTER_TYPES;
  readonly ALL_INPUT_SPEEDS = ALL_INPUT_SPEEDS;
  readonly ALL_START_LEVELS = [18, 19, 29];

  readonly averageFunc = (m: Metric) => m.getAverage();
  readonly medianFunc = (m: Metric) => m.getMedian();
  readonly bestFunc = (m: Metric) => m.getBest();
  readonly worstFunc = (m: Metric) => m.getWorst();

  adapterTypeToString(type: AIAdapterType): string {
    return ADAPTER_MAP[type].getGenericName();
  }

  constructor(private route: ActivatedRoute) {
    
    // sanitize and update botConfig from URL
    this.route.queryParams.subscribe(params => {
      this.botConfig.aiType = convertToEnum(AIAdapterType, params['ai'], ALL_ADAPTER_TYPES[0]) as AIAdapterType;
      this.botConfig.variant = params['variant']; // will be sanitized by onAITypeChange()
      this.botConfig.inputSpeed = convertToEnum(InputSpeed, parseInt(params['hz']), InputSpeed.HZ_30) as InputSpeed;
      
      const level = parseInt(params['level']);
      this.botConfig.startLevel = [18, 19, 29].includes(level) ? level : 18;

      this.botConfig.rngType = convertToEnum(RNGType, params['rng'], RNGType.RANDOM) as RNGType;
      this.botConfig.reactionTimeFrames = parseInt(params['reaction']) || 0;
      this.botConfig.linecap = convertToEnum(Linecap, parseInt(params['linecap']), Linecap.NOCAP) as Linecap;
      this.botConfig.misdropRate = parseFloat(params['misdrop']) || 0;
    });

    this.onAITypeChange();
  }

  onAITypeChange() {

    // if variant does not exist, set to first variant
    if (!this.getSelectedAI().getVariants().includes(this.botConfig.variant)) {
      this.botConfig.variant = this.getSelectedAI().getVariants()[0];
    }

  // update URL that encodes botConfig settings
    const params = new URLSearchParams();
    params.set("ai", this.botConfig.aiType);
    params.set("variant", this.botConfig.variant);
    params.set("hz", this.botConfig.inputSpeed.toString());
    params.set("level", this.botConfig.startLevel.toString());
    params.set("rng", this.botConfig.rngType);
    params.set("reaction", this.botConfig.reactionTimeFrames.toString());
    params.set("linecap", this.botConfig.linecap.toString());
    params.set("misdrop", this.botConfig.misdropRate.toString());

    window.history.replaceState({}, "", `/bot-playground?${params.toString()}`);

    this.autoplay = false;
    this.autoplayLeft = 0;

    this.resetGame();
    this.stats = new AISimulationStats();
  }


  resetGame() {
    this.stopGame();
    this.placementIndex = 0;
    const rng = RNG_MAP[this.botConfig.rngType];
    this.simulation = new AISimulation(this.getSelectedAI(), this.botConfig.variant, rng, this.botConfig.startLevel, this.botConfig.inputSpeed, this.botConfig.reactionTimeFrames);
    this.isToppedOut = false;
  }

  startGame(restartGame: boolean = false) {

    if (restartGame) {
      this.resetGame();
    }

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

  startAutoplay() {

    const response = prompt("Autoplay will automatically play some number of games without needing you to restart games. How many games do you want to autoplay? (limit: 100)");
    if (response === null) return;

    const numGames = parseInt(response);
    if (isNaN(numGames) || numGames < 1 || numGames > 100) {
      alert("Invalid number of games");
      return;
    }

    this.autoplay = true;
    this.autoplayLeft = numGames;
    if (!this.playing) {
      if (this.isToppedOut) this.resetGame();
      this.startGame();
    }
  }

  stopAutoplay() {
    this.autoplay = false;
    if (this.playing) {
      this.stopGame();
    }
  }

  goToPreviousPlacement() {
    this.placementIndex = Math.max(0, this.placementIndex - 1);
  }

  // add game stats
  private onTopOutGame() {
    console.log("Game topped out");
    this.stats.onGameEnd(this.simulation.getLastState().status.score, this.simulation.stats);
  }

  // if the no new placements in cache, simulate new one
  async goToNextPlacement() {

    if (this.simulation.isSimulating()) return;

    if (this.placementIndex === this.simulation.getNumPlacements()) {
      const success = await this.simulation.simulateOnePlacement();
      if (!success) {
        this.stopGame();

        if (!this.isToppedOut) {
          this.onTopOutGame();
          this.isToppedOut = true;

          // handle autoplay
          if (this.autoplay) {
            if (this.autoplayLeft > 0) {
              this.autoplayLeft--;
              if (this.autoplayLeft === 0) this.autoplay = false;
              this.startGame(true);
            } else {
              this.autoplay = false;
            }
          }

        }

        return;
      }
    }
    this.placementIndex = Math.min(this.placementIndex + 1, this.simulation.getNumPlacements());
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

  aggregateCurrent(level: StatLevel): string[] | undefined {

    const subscore = this.simulation.stats.getSubscore(level);
    if (subscore === undefined) return undefined;

    const nums = [
      subscore.getScore(),
      subscore.lineClearStats.getTetrisRate(),
      subscore.rightWellOpenStats.getRightWellOpen(subscore.getNumPositions()),
      subscore.tetrisReadinessStats.getTetrisReadiness(subscore.getNumPositions()),
    ];

    // divide by 100, round to whole number and add % sign. except first element
    return nums.map((n, i) => i === 0 ? n.toFixed(0) : (n! * 100).toFixed(0) + "%");

  }

  aggregate(level: StatLevel, func: ((m: Metric) => number | undefined)): string[] | undefined {
    const stats = this.stats.statsForLevel[level];

    if (!stats.hasValues()) return undefined;

    const nums = [
      func(stats.subscore)!,
      func(stats.tetrisRate)!,
      func(stats.rightWellOpen)!,
      func(stats.tetrisReady)!,
    ];

    // divide by 100, round to whole number and add % sign. except first element
    return nums.map((n, i) => i === 0 ? n.toFixed(0) : (n! * 100).toFixed(0) + "%");

  }

  exportStatisticsAsCSV() {

    // if no games played, do nothing
    if (this.stats.getNumGamesPlayed() === 0) return;

    const csvData = this.stats.getCSVStats();
    exportToCSV(csvData, `simulation_statistics_${this.botConfig.aiType}_${this.botConfig.variant}_${this.stats.getNumGamesPlayed()}_games.csv`);
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
