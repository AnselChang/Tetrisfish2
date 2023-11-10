import { Component } from '@angular/core';
import { EvaluationRating } from 'client/src/app/misc/colors';
import MoveableTetromino from 'client/src/app/models/game-models/moveable-tetromino';
import BinaryGrid, { BlockType } from 'client/src/app/models/tetronimo-models/binary-grid';
import { Tetromino } from 'client/src/app/models/tetronimo-models/tetromino';
import { findFourConnectedComponent } from 'client/src/app/scripts/connected-components';

@Component({
  selector: 'app-puzzles-page',
  templateUrl: './puzzles-page.component.html',
  styleUrls: ['./puzzles-page.component.scss']
})
export class PuzzlesPageComponent {

  constructor() {
    const grid = new BinaryGrid();
    grid._setFromString("00001100000000011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011000000001100000000000000000011000000001100000001000000000000011001101001100110000");
    const spawnedMinos = findFourConnectedComponent(grid);
    const spawnedMinosGrid = new BinaryGrid();
    spawnedMinos?.forEach(({ x, y }) => spawnedMinosGrid.setAt(x, y, BlockType.FILLED));
    spawnedMinosGrid.print();
  }

}
