import { Component, OnInit } from '@angular/core';
import { RATING_TO_COLOR, getRatingFromAveragePercent } from 'client/src/app/models/evaluation-models/rating';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import { LeaderboardEntry, LeaderboardType } from 'server/database/leaderboard/leaderboard-schema';

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard-page.component.html',
  styleUrls: ['./leaderboard-page.component.scss']
})
export class LeaderboardPageComponent implements OnInit {

  private type: LeaderboardType = LeaderboardType.OVERALL;

  private leaderboards: {[type in LeaderboardType]: LeaderboardEntry[]} = {
    [LeaderboardType.OVERALL]: [],
    [LeaderboardType.START_29]: []
  };

  constructor() {}

  ngOnInit(): void {
    
    // fetch overall leaderboard asynchronously
    fetchServer(Method.GET, '/api/get-leaderboard-overall').then(({status, content}) => {
      if (status !== 200) {
        console.log("Error fetching leaderboard overall");
        return;
      }
      this.leaderboards[LeaderboardType.OVERALL] = content as LeaderboardEntry[];

      
      // calculate time strings
      const now = new Date();
      for (const entry of this.leaderboards[LeaderboardType.OVERALL]) {
        entry.timeString = formatDistanceStrict(new Date(entry.timestamp), now) + " ago";
      }

      console.log("overall leaderboards", this.leaderboards);
    });

    // fetch 29 leaderboard asynchronously
    fetchServer(Method.GET, '/api/get-leaderboard-29').then(({status, content}) => {
      if (status !== 200) {
        console.log("Error fetching leaderboard 29");
        return;
      }
      this.leaderboards[LeaderboardType.START_29] = content as LeaderboardEntry[];

      // calculate time strings
      const now = new Date();
      for (const entry of this.leaderboards[LeaderboardType.START_29]) {
        entry.timeString = formatDistanceStrict(new Date(entry.timestamp), now) + " ago";
      }
      
      console.log("29 leaderboards", this.leaderboards);
    });

  }

  public getOverallLeaderboard(): LeaderboardEntry[] {
    return this.leaderboards[LeaderboardType.OVERALL];
  }

  public get29Leaderboard(): LeaderboardEntry[] {
    return this.leaderboards[LeaderboardType.START_29];
  }

  public getCurrentLeaderboard(): LeaderboardEntry[] {
    return this.leaderboards[this.type];
  }

  public isTypeOverall(): boolean {
    return this.type === LeaderboardType.OVERALL;
  }

  public isType29(): boolean {
    return this.type === LeaderboardType.START_29;
  }

  public setTypeOverall() {
    this.type = LeaderboardType.OVERALL;
  }

  public setType29() {
    this.type = LeaderboardType.START_29;
  }

  formatAccuracy(accuracy: number, round: number): string {
    return (accuracy*100).toFixed(round) + "%";
  }

  getAccuracyColor(accuracy: number): string {
    const rating = getRatingFromAveragePercent(accuracy);
    return RATING_TO_COLOR[rating];
  }
}
