import { Component } from '@angular/core';
import { RATING_TO_COLOR, getRatingFromAveragePercent } from 'client/src/app/models/evaluation-models/rating';
import { numberWithCommas } from 'client/src/app/scripts/utilities';
import { GameHistoryService } from 'client/src/app/services/game-history.service';
import { formatDistanceStrict } from 'date-fns'

@Component({
  selector: 'app-game-history-panel',
  templateUrl: './game-history-panel.component.html',
  styleUrls: ['./game-history-panel.component.scss']
})
export class GameHistoryPanelComponent {

  constructor(public gameHistoryService: GameHistoryService) {

  }

  public get history() {
    return this.gameHistoryService.get();
  }

  getColorForAccuracy(accuracy: number): string {
    return RATING_TO_COLOR[getRatingFromAveragePercent(accuracy)];
  }

  getTimeString(date: Date): string {
    const result = formatDistanceStrict(date, this.gameHistoryService.getNow());
    return result + " ago";
  }

  formatScore(score: number): string {
    return numberWithCommas(score);
  }

  formatAccuracy(accuracy: number): string {
    return (accuracy*100).toFixed(2) + "%";
  }
}
