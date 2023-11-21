import { Injectable } from '@angular/core';
import { GameHistoryGame } from 'shared/models/game-history-game';

// caches the fetch requests for full game history from server

@Injectable({
  providedIn: 'root'
})
export class GameHistoryCacheService {

  private gameHistoryCache?: GameHistoryGame[];

  constructor() { }

  public get(): GameHistoryGame[] | undefined {
    return this.gameHistoryCache;
  }

  public set(gameHistory: GameHistoryGame[]): void {
    this.gameHistoryCache = gameHistory;
  }

  public hasCache(): boolean {
    return this.gameHistoryCache !== undefined;
  }

  public pushGameToCache(game: GameHistoryGame): void {
    if (!this.hasCache()) throw new Error("No cache to push game to");
    this.gameHistoryCache!.push(game);
  }
}
