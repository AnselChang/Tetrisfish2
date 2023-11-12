import { Component, Input } from '@angular/core';
import { RATING_TO_COLOR, Rating } from 'client/src/app/models/evaluation-models/rating';
import { GameAnalysisStats } from 'client/src/app/models/game-models/game-analysis-stats';
import { ALL_TETROMINO_TYPES } from 'client/src/app/models/tetronimo-models/tetromino';
import { InputSpeed } from 'client/src/app/scripts/evaluation/input-frame-timeline';

@Component({
  selector: 'app-accuracy-panel',
  templateUrl: './accuracy-panel.component.html',
  styleUrls: ['./accuracy-panel.component.scss']
})
export class AccuracyPanelComponent {
  @Input() inputSpeed!: InputSpeed;
  @Input() stats?: GameAnalysisStats;
  @Input() leaderboardRank: number | undefined;
  @Input() leaderboardValid: boolean = false;

  readonly redColor: string;
  readonly ALL_TETROMINO_TYPES = ALL_TETROMINO_TYPES;

  constructor() {
    this.redColor = RATING_TO_COLOR[Rating.BLUNDER];
  }

}
