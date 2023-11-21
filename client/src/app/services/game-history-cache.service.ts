import { Injectable } from '@angular/core';
import { GameHistoryGame } from 'shared/models/game-history-game';

// caches the fetch requests for full game history from server

@Injectable({
  providedIn: 'root'
})
export class GameHistoryCacheService {

  private gameHistoryCache?: GameHistoryGame[];

  private sortDescending: boolean = true;
  private sortBy: keyof GameHistoryGame = "timestamp";

  constructor() { }

  public get(): GameHistoryGame[] | undefined {
    return this.gameHistoryCache;
  }

  public set(gameHistory: GameHistoryGame[]): void {
    this.gameHistoryCache = gameHistory;
    this.sort();
  }

  public hasCache(): boolean {
    return this.gameHistoryCache !== undefined;
  }

  public pushGameToCache(game: GameHistoryGame): void {
    if (!this.hasCache()) throw new Error("No cache to push game to");
    this.gameHistoryCache!.push(game);
    this.sort();
  }

  public setSortKey(key: keyof GameHistoryGame): void {
    this.sortDescending = (key === this.sortBy) ? !this.sortDescending : true;
    this.sortBy = key;
    this.sort();
  }

  public getSortKey(): keyof GameHistoryGame {
    return this.sortBy;
  }

  public getSortDescending(): boolean {
    return this.sortDescending;
  }

  private _undef(value: any): boolean {
    return value === undefined || value === null;
  }

  private sort() {
    if (!this.hasCache()) return;

    this.gameHistoryCache!.sort((a, b) => {
      const aVal = a[this.sortBy];
      const bVal = b[this.sortBy];

      if (this._undef(aVal) && this._undef(bVal)) return 0;
      if (this._undef(aVal) && !this._undef(bVal)) return this.sortDescending ? 1 : -1;
      if (!this._undef(aVal) && this._undef(bVal)) return this.sortDescending ? -1 : 1;
      if (aVal! > bVal!) return this.sortDescending ? -1 : 1;
      if (aVal! < bVal!) return this.sortDescending ? 1 : -1;
      return 0;
    });
  }

}
