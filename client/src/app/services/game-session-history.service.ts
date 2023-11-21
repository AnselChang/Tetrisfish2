import { Injectable } from '@angular/core';
import GameSessionHistory from '../models/game-models/game-session-history';

@Injectable({
  providedIn: 'root'
})
export class GameSessionHistoryService {

  private readonly gameHistory = new GameSessionHistory();
  private now = new Date();

  constructor() {
    // every 30 seconds, update the current time
    setInterval(() => {
      this.now = new Date();
    }, 1000 * 10);
  }

  public get(): GameSessionHistory {
    return this.gameHistory;
  }

  public getNow(): Date {
    return this.now;
  }

}
