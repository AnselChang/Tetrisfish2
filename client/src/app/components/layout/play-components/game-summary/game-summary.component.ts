import { Component, Input } from '@angular/core';
import { GameStats } from 'client/src/app/models/game-models/game-stats';

@Component({
  selector: 'app-game-summary',
  templateUrl: './game-summary.component.html',
  styleUrls: ['./game-summary.component.scss']
})
export class GameSummaryComponent {
  @Input() stats?: GameStats;

  getTetrisRateString(): string {
    if (!this.stats) return "-";
    return Math.round(this.stats.getTetrisRate() * 100) + "%";
  }

}
