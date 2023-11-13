import { Injectable } from '@angular/core';
import GameHistory from '../models/game-models/game-history';

@Injectable({
  providedIn: 'root'
})
export class GameHistoryService {

  private readonly gameHistory = new GameHistory();
  private now = new Date();

  constructor() {
    // every 30 seconds, update the current time
    setInterval(() => {
      this.now = new Date();
    }, 1000 * 10);
  }

  public get(): GameHistory {
    return this.gameHistory;
  }

  public getNow(): Date {
    return this.now;
  }

}
