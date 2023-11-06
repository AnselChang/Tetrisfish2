import { Injectable } from '@angular/core';
import { ExtractedStateService } from '../capture/extracted-state.service';
import { ExtractedState } from '../../models/capture-models/extracted-state';

/*
Handles the game lifecycle, from starting the game, processing each piece placement,
and ending the game.
*/

export enum GameStatus {
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  NOT_PLAYING = "NOT_PLAYING"
}

export enum PlayCalibratePage {
  PLAY = "PLAY",
  CALIBRATE = "CALIBRATE"
}
  

@Injectable({
  providedIn: 'root'
})
export class GameStateMachineService {

  private playCalibratePage: PlayCalibratePage = PlayCalibratePage.PLAY;
  private gameStatus: GameStatus = GameStatus.NOT_PLAYING;

  private gameStartLevel: number = 0;

  constructor(private extractedStateService: ExtractedStateService) { }

  public startGame(): void {
    this.gameStatus = GameStatus.PLAYING;
    this.gameStartLevel = this.extractedStateService.get().getStatus().level;
  }

  public endGame(): void {
    this.gameStatus = GameStatus.NOT_PLAYING;
  }

  // executes once per frame to update state machine. Main method for this class
  public tick(): void {

    const state = this.extractedStateService.get();

    if (this.gameStatus === GameStatus.NOT_PLAYING) {

      // if game start detected, then start game
      if (this.detectGameStart(state)) {
        this.startGame();
      }

    } else if (this.gameStatus === GameStatus.PLAYING) {

      // If user switched to calibrate page, end game
      if (this.playCalibratePage === PlayCalibratePage.CALIBRATE) {
        this.endGame();
      }

    }

  }

  // assuming it was previously not playing, check for game start conditions:
  // 1. Board has 4 minos
  // 2. Next piece is valid
  private detectGameStart(state: ExtractedState): boolean {

    if (state.getGrid().minoCount() !== 4) return false;
    if (state.getNextPieceType() === undefined) return false;
    return true;
  }

  public getGameStatus(): GameStatus {
    return this.gameStatus;
  }

  public getGameStartLevel(): number {
    return this.gameStartLevel;
  }

  public getPlayCalibratePage(): PlayCalibratePage {
    return this.playCalibratePage;
  }

  public setPlayCalibratePage(page: PlayCalibratePage): void {
    this.playCalibratePage = page;
  }

}
