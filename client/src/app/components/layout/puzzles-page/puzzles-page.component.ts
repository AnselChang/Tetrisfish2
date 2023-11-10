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
    grid._setFromString("00011110000000000000000000000000000000000000000000000000000000000000000000000000110000000011000000001100000000111000000011111000001111100000111110000011111100001111111000111111111011111111101111111110");
    const spawnedMinos = findFourConnectedComponent(grid);
    const spawnedMinosGrid = new BinaryGrid();
    spawnedMinos?.forEach(({ x, y }) => spawnedMinosGrid.setAt(x, y, BlockType.FILLED));
    spawnedMinosGrid.print();
  }

}
