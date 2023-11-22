import { Component } from '@angular/core';
import { LeaderboardType } from 'server/database/leaderboard/leaderboard-schema';

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard-page.component.html',
  styleUrls: ['./leaderboard-page.component.scss']
})
export class LeaderboardPageComponent {

  private type: LeaderboardType = LeaderboardType.OVERALL;

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

}
