import { Component } from '@angular/core';
import { EvaluationRating } from 'client/src/app/misc/colors';
import MoveableTetromino from 'client/src/app/models/game-models/moveable-tetromino';
import { Tetromino } from 'client/src/app/models/tetronimo-models/tetromino';

@Component({
  selector: 'app-puzzles-page',
  templateUrl: './puzzles-page.component.html',
  styleUrls: ['./puzzles-page.component.scss']
})
export class PuzzlesPageComponent {

  public leftValue: EvaluationRating = EvaluationRating.BEST;
  public rightValue: EvaluationRating = EvaluationRating.MISTAKE;

  constructor() {

    for (let piece of Tetromino.ALL_PIECES) {
      for (let rot = 0; rot < piece.numPossibleRotations(); rot++) {
        const mt = new MoveableTetromino(piece.type, rot, 0, 0);
        console.log("piece: ", piece.type, " rot: ", rot);
        mt.print();
      }
    }

  }

}
