import { Injectable } from '@angular/core';
import { GameCaptureState } from '../../models/game-models/game-capture-state';

/*
Stores the board data as it is captured and send to server
*/

@Injectable({
  providedIn: 'root'
})
export class CaptureDataService {

  private captureState: GameCaptureState = new GameCaptureState();

  constructor() { }

  public get(): GameCaptureState {
    return this.captureState;
  }

  public set(state: GameCaptureState): void {
    this.captureState = state;
  }

}
