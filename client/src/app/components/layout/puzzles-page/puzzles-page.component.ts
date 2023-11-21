import { Component } from '@angular/core';
import { EvaluationRating } from 'client/src/app/misc/colors';
import MoveableTetromino from 'client/src/app/models/game-models/moveable-tetromino';
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

  constructor() {
    
    // create binary grid with random blocks
    const grid = new BinaryGrid();
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 20; y++) {
        grid.setAt(x, y, Math.random() < 0.5 ? BlockType.FILLED : BlockType.EMPTY);
      }
    }

    const gridString = grid._getAsString();
    console.log("start", gridString);
    const compressed = compressGridStringToBase64(gridString);
    console.log("compressed", compressed);
    const decompressed = decompressBase64ToGridString(compressed);
    console.log("decompressed", decompressed);

  }

}
