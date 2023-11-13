import { Component } from '@angular/core';
import { EvaluationRating } from 'client/src/app/misc/colors';
import MoveableTetromino from 'client/src/app/models/game-models/moveable-tetromino';
import TagAssigner, { SimplePlacement } from 'client/src/app/models/tag-models/tag-assigner';
import BinaryGrid, { BlockType } from 'client/src/app/models/tetronimo-models/binary-grid';
import { Tetromino, TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';
import { findConnectedComponent } from 'client/src/app/scripts/connected-components';

@Component({
  selector: 'app-puzzles-page',
  templateUrl: './puzzles-page.component.html',
  styleUrls: ['./puzzles-page.component.scss']
})
export class PuzzlesPageComponent {

  constructor() {
    
    const placement = new SimplePlacement(
      new BinaryGrid(),
      new MoveableTetromino(TetrominoType.T_TYPE, 0, 0, 0),
      new MoveableTetromino(TetrominoType.T_TYPE, 0, 0, 0),
    );
    
    const tags = TagAssigner.assignTagsFor(placement);
    console.log(tags);

  }

}
