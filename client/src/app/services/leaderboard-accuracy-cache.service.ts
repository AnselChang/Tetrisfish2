import { Injectable } from '@angular/core';
import { LeaderboardType } from 'server/database/leaderboard/leaderboard-schema';
import { Method, fetchServer } from '../scripts/fetch-server';
import { Game } from '../models/game-models/game';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardAccuracyCacheService {

  private accuracies: {[type in LeaderboardType] : number[] | undefined} = {
    [LeaderboardType.OVERALL]: undefined,
    [LeaderboardType.START_29]: undefined,
  };

  private game?: Game;
  private leaderboardRank?: number;

  constructor() { }

  public registerGame(game: Game) {

    this.leaderboardRank = undefined;

    // unsubscrbe 
    if (this.game) {
      this.game.onOverallAccuracyChange$.unsubscribe();
    }

    this.game = game;
   
    let type: LeaderboardType;
    if (this.game.startLevel === 29) type = LeaderboardType.START_29;
    else if (this.game.startLevel === 18 || this.game.startLevel === 19) type = LeaderboardType.OVERALL;
    else return;

    this.game.onOverallAccuracyChange$.subscribe((overallAccuracy) => {
      this.leaderboardRank = this.predictLeaderboardRank(type, overallAccuracy);  
    });
  }

  public getLeaderboardRank(): number | undefined {
    return this.leaderboardRank;
  }

  public syncAccuraciesWithServer(type: LeaderboardType): void {

    const request = (type === LeaderboardType.OVERALL) ? "api/get-leaderboard-accuracy-overall" : "api/get-leaderboard-accuracy-29";

    fetchServer(Method.GET, request).then(({status, content}) => {
      if (status !== 200) {
        console.log("Error fetching leaderboard accuracy");
        return;
      }
      this.accuracies[type] = content as number[];
    });
  }

  // given a player's current accuracy and the leaderboard type, predict what rank they will be
  // return undefined if unknown
  // return -1 if not on leaderboard
  public predictLeaderboardRank(type: LeaderboardType, accuracy: number): number | undefined {

    if (this.accuracies[type] === undefined) return undefined;

    const accuracies = this.accuracies[type]!;


    let rank = 1;
    for (const otherAccuracy of accuracies) {
      if (accuracy < otherAccuracy) rank++;
      else break;
    }

    if (rank > 100) return -1;

    return rank;

  }
}
