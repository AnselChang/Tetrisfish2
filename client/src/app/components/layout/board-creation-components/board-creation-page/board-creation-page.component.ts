import { Component, Renderer2 } from '@angular/core';
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

  private blockOnMouseDown?: BlockData;
  private blockOnHover?: BlockData;
  private oldGrid?: BinaryGrid;
  private fillType: BlockType = BlockType.FILLED;
  private mouseDown: boolean = false;
  private hoveringOverBoard: boolean = false;
  private mouseUpListener: Function | null = null;


  constructor(private renderer: Renderer2) {}
  
  public onBlockHover(block: BlockData) {

    this.hoveringOverBoard = true;

    // set all blocks in the rectangle made by blockOnMouseDown and block to the fill type
    if (this.mouseDown && this.blockOnMouseDown && this.oldGrid) {

      // revert to old grid
      this.boardState.grid = this.oldGrid.copy();

      // fill in new grid
      const minX = Math.min(this.blockOnMouseDown!.x, block.x);
      const maxX = Math.max(this.blockOnMouseDown!.x, block.x);
      const minY = Math.min(this.blockOnMouseDown!.y, block.y);
      const maxY = Math.max(this.blockOnMouseDown!.y, block.y);
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          this.boardState.grid.setAt(x, y, this.fillType);
        }
      }
    }
  }

  public onMouseDown(block: BlockData) {

    // make a copy of grid to revert to whenever mouse is moved so that fill can be applied again
    this.oldGrid = this.boardState.grid.copy();

    this.blockOnMouseDown = block;
    this.fillType = this.boardState.grid.at(block.x, block.y) === BlockType.FILLED ? BlockType.EMPTY : BlockType.FILLED;
    this.boardState.grid.setAt(block.x, block.y, this.fillType);
    this.mouseDown = true;

    // listen for mouse up globally
    this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.onGlobalMouseUp.bind(this));

  }

  public onGlobalMouseUp() {
    this.mouseDown = false;

    if (!this.hoveringOverBoard) {
      this.boardState.grid = this.oldGrid!;
    }

    // remove listener
    if (this.mouseUpListener) {
      this.mouseUpListener();
      this.mouseUpListener = null;
    }

  }

  public onHoverOff() {
    this.hoveringOverBoard = false;
  }

}
