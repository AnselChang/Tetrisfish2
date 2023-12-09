import { Component, HostListener } from '@angular/core';
import { AbstractAIAdapter } from 'client/src/app/ai/abstract-ai-adapter/abstract-ai-adapter';
import { BestMoveResponse } from 'client/src/app/ai/abstract-ai-adapter/best-move-response';
import { ALL_ADAPTERS } from 'client/src/app/ai/ai-adapters/all-adapters';
import { RandomPieceSequenceGenerator } from 'client/src/app/ai/piece-sequence-generation/random-piece-sequence-generator';
import { AISimulation } from 'client/src/app/ai/simulation/ai-simulation';
import { SimulationState } from 'client/src/app/ai/simulation/simulation-state';
import { TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';

@Component({
  selector: 'app-bot-playground',
  templateUrl: './bot-playground.component.html',
  styleUrls: ['./bot-playground.component.scss']
})
export class BotPlaygroundComponent {

  public selectedAI: AbstractAIAdapter = ALL_ADAPTERS[0];

  // placementIndex is simulation.placements[placementIndex].stateBefore
  // placementIndex+1 is simulation.placements[placementIndex].stateAfter
  public placementIndex: number = 0;
  public playing: boolean = false;

  private playingLoopID?: any;

  readonly simulation: AISimulation;

  constructor() {
    this.simulation = new AISimulation(this.selectedAI, new RandomPieceSequenceGenerator(), 18);
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

  // if the no new placements in cache, simulate new one
  async goToNextPlacement() {

    if (this.simulation.isSimulating()) return;

    if (this.placementIndex === this.simulation.getNumPlacements()) {
      const success = await this.simulation.simulateOnePlacement();
      if (!success) {
        this.stopGame();
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

  getCurrentPlacement(): BestMoveResponse | undefined {
    if (this.placementIndex === 0) {
      return undefined;
    }
    else {
      return this.simulation.getPlacementAtIndex(this.placementIndex - 1).getPlacement();
    }
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
