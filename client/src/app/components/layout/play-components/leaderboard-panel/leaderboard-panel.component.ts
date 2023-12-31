import { Component, Input } from '@angular/core';
import { RATING_TO_COLOR, Rating } from 'client/src/app/models/evaluation-models/rating';
import GameEligibility from 'client/src/app/models/game-models/game-eligibility';
import { LEADERBOARD_TYPE_TO_NAME } from 'client/src/app/models/leaderboard-models/leaderboards';
import { InputSpeed } from 'client/src/app/scripts/evaluation/input-frame-timeline';

@Component({
  selector: 'app-leaderboard-panel',
  templateUrl: './leaderboard-panel.component.html',
  styleUrls: ['./leaderboard-panel.component.scss']
})
export class LeaderboardPanelComponent {
  @Input() eligibility!: GameEligibility;
  @Input() leaderboardRank?: number; // undefined if unknown, -1 if not on leaderboard
  @Input() maxLeaderboardRank: number = 100; // undefined if not on leaderboard
  @Input() inputSpeed!: InputSpeed;

  readonly redColor: string;

  getLeaderboardName(): string {
    const leaderboard = this.eligibility.getEligibility();
    if (!leaderboard) {
      return "Leaderboard";
    }

    return LEADERBOARD_TYPE_TO_NAME[leaderboard];
  }

  getRankString(): string {
    if (this.eligibility.getEligibility() === undefined) return "Ineligible";
    if (this.leaderboardRank === undefined) return "Unknown";
    if (this.leaderboardRank === -1) return "Over #" + this.maxLeaderboardRank;
    return "#" + this.leaderboardRank;
  }


  is30Hz() {
    return this.eligibility.inputSpeed === InputSpeed.HZ_30;
  }

  constructor() {
    this.redColor = RATING_TO_COLOR[Rating.BLUNDER];
  }
}
