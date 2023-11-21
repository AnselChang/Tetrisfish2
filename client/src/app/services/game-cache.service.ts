import { Injectable } from '@angular/core';
import { Game } from '../models/game-models/game';

/*
Cache the last N games that have been visited.
This way, analysis doesn't have to be re-run when the user navigates back to a game.
*/

@Injectable({
  providedIn: 'root'
})
export class GameCacheService {

  public readonly CACHE_SIZE = 3;

  private games: Game[] = [];

  constructor() { }

  public hasGame(gameID: string): boolean {
    return this.games.some(game => game.gameID === gameID);
  }

  public getGame(gameID: string): Game | undefined {
    return this.games.find(game => game.gameID === gameID);
  }

  public cacheGame(game: Game): void {
    console.log("Cache:", this.games.map(game => game.gameID));
    this.games.push(game);
    if (this.games.length > this.CACHE_SIZE) {
      this.games.shift();
    }
  }

}
