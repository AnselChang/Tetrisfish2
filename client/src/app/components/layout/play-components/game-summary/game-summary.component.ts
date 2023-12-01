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

  percentInDroughtString(): string {
    if (!this.stats) return "-";
    const percent = this.stats.getPercentInDrought();
    return Math.round(percent * 100) + "%";
  }

  rightWellOpenString(): string {
    if (!this.stats) return "-";
    const open = this.stats.getRightWellOpen();
    return Math.round(open * 100) + "%";
  }

  tetrisReadinessString(): string {

    if (!this.stats) return "-";
    const readiness = this.stats!.getTetrisReadiness();
    return Math.round(readiness * 100) + "%";
  }

  iPieceEfficiencyString(): string {
    if (!this.stats) return "-";
    const efficiency = this.stats.getIPieceEfficiency();
    return Math.round(efficiency * 100) + "%";
  }

}
