import { Component, OnInit } from '@angular/core';
import BoardState from '../components/tetris/interactive-tetris-board/board-state';
import GameStatus from '../components/tetris/immutable-tetris-models/game-status';
import BinaryGrid, { BlockType } from '../components/tetris/mutable-tetris-models/binary-grid';
import { TetrominoType } from '../components/tetris/immutable-tetris-models/tetromino';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  public boardState: BoardState;

  constructor() {

    const status = new GameStatus(18, 120, 400000);
    const grid = new BinaryGrid();
    // randomly populate grid
    for (let x = 1; x <= 10; x++) {
      for (let y = 1; y <= 20; y++) {
        grid.setAt(x, y, Math.random() > 0.5 ? BlockType.FILLED : BlockType.EMPTY);
      }
    }

    this.boardState = new BoardState(status, grid, TetrominoType.L_TYPE, TetrominoType.T_TYPE);
  }

  ngOnInit(): void {
      
  }

}
