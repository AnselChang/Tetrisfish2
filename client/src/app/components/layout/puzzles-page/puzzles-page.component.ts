import { Component } from '@angular/core';
import { EvaluationRating } from 'client/src/app/misc/colors';
import MoveableTetromino from 'client/src/app/models/game-models/moveable-tetromino';
import { Puzzle } from 'client/src/app/models/puzzle';
import TagAssigner, { SimplePlacement } from 'client/src/app/models/tag-models/tag-assigner';
import BinaryGrid, { BlockType } from 'client/src/app/models/tetronimo-models/binary-grid';
import { Tetromino, TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';
import { findConnectedComponent } from 'client/src/app/scripts/connected-components';
import { compressGridStringToBase64, decompressBase64ToGridString } from 'shared/scripts/compress-grid';

@Component({
  selector: 'app-puzzles-page',
  templateUrl: './puzzles-page.component.html',
  styleUrls: ['./puzzles-page.component.scss']
})
export class PuzzlesPageComponent {

  public puzzle: Puzzle;

  constructor() {
    
    this.puzzle = new Puzzle(
      new BinaryGrid(),
      new MoveableTetromino(TetrominoType.I_TYPE, 0, 0, 0),
      new MoveableTetromino(TetrominoType.J_TYPE, 0, 0, 0),
      0
    );

  }

}
