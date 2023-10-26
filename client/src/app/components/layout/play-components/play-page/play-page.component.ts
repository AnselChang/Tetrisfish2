import { Component } from '@angular/core';
import BoardState from '../../../tetris/interactive-tetris-board/board-state';
import GameStatus from 'client/src/app/models/immutable-tetris-models/game-status';
import BinaryGrid, { BlockType } from 'client/src/app/models/mutable-tetris-models/binary-grid';
import { TetrominoType } from 'client/src/app/models/immutable-tetris-models/tetromino';

enum PanelMode {
  PLAY = "PLAY",
  CALIBRATE = "CALIBRATE"
}

@Component({
  selector: 'app-play-page',
  templateUrl: './play-page.component.html',
  styleUrls: ['./play-page.component.scss']
})
export class PlayPageComponent {
  
  public boardState: BoardState;
  public panelMode: PanelMode = PanelMode.PLAY;

  constructor() {

    const grid = new BinaryGrid();
    // randomly populate grid
    for (let x = 1; x <= 10; x++) {
      for (let y = 1; y <= 20; y++) {
        grid.setAt(x, y, Math.random() > 0.5 ? BlockType.FILLED : BlockType.EMPTY);
      }
    }

    this.boardState = new BoardState(18, grid, TetrominoType.L_TYPE, TetrominoType.T_TYPE);
  }

  public get panelCalibrateMode(): boolean {
    return this.panelMode === PanelMode.CALIBRATE;
  }

  public getLevel(): number {
    return 18;
  }

  public getLines(): number {
    return 120;
  }

  public getScore(): number {
    return 543223;
  }

}
