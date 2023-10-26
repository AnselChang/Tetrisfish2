import { Component } from '@angular/core';
import { BlockData, TetrisBoardMode } from '../../../tetris/interactive-tetris-board/interactive-tetris-board.component';
import BoardState from '../../../tetris/interactive-tetris-board/board-state';
import GameStatus from 'client/src/app/models/immutable-tetris-models/game-status';
import BinaryGrid, { BlockType } from 'client/src/app/models/mutable-tetris-models/binary-grid';
import { TetrominoType } from 'client/src/app/models/immutable-tetris-models/tetromino';

@Component({
  selector: 'app-board-creation-page',
  templateUrl: './board-creation-page.component.html',
  styleUrls: ['./board-creation-page.component.scss']
})
export class BoardCreationPageComponent {

  readonly TetrisBoardMode = TetrisBoardMode;

  public boardState = new BoardState(18, new BinaryGrid(), TetrominoType.J_TYPE, TetrominoType.T_TYPE);
  
  public onPlacePiece(block: BlockData) {
    console.log("Placed piece at " + block.x + ", " + block.y);

    const newValue = this.boardState.grid.at(block.x, block.y) === BlockType.FILLED ? BlockType.EMPTY : BlockType.FILLED;
    this.boardState.grid.setAt(block.x, block.y, newValue);
  }

}
