import { Component, Renderer2 } from '@angular/core';
import { BlockData, TetrisBoardMode } from '../../../tetris/interactive-tetris-board/interactive-tetris-board.component';
import GameStatus from 'client/src/app/models/tetromino-models/game-status';
import BinaryGrid, { BlockType } from 'client/src/app/models/game-models/binary-grid';
import { TetrominoType } from 'client/src/app/models/tetromino-models/tetromino';
import { BoardCreationCacheService } from 'client/src/app/services/board-creation-cache.service';
import { EvaluatorService } from 'client/src/app/services/analysis/evaluator.service';
import { GamePosition } from 'client/src/app/models/game-models/game-position';
import { HZ_10 } from 'client/src/app/services/analysis/input-frame-timeline';

@Component({
  selector: 'app-board-creation-page',
  templateUrl: './board-creation-page.component.html',
  styleUrls: ['./board-creation-page.component.scss']
})
export class BoardCreationPageComponent {

  readonly TetrisBoardMode = TetrisBoardMode;

  private blockOnMouseDown?: BlockData;
  private oldGrid?: BinaryGrid;
  private fillType: BlockType = BlockType.FILLED;
  private mouseDown: boolean = false;
  private hoveringOverBoard: boolean = false;
  private mouseUpListener: Function | null = null;


  constructor(private renderer: Renderer2, public cache: BoardCreationCacheService,
    private evaluatorService: EvaluatorService
    ) {}
  
  public onBlockHover(block: BlockData) {

    this.hoveringOverBoard = true;

    // set all blocks in the rectangle made by blockOnMouseDown and block to the fill type
    if (this.mouseDown && this.blockOnMouseDown && this.oldGrid) {

      // revert to old grid
      this.cache.grid = this.oldGrid.copy();

      // fill in new grid
      const minX = Math.min(this.blockOnMouseDown!.x, block.x);
      const maxX = Math.max(this.blockOnMouseDown!.x, block.x);
      const minY = Math.min(this.blockOnMouseDown!.y, block.y);
      const maxY = Math.max(this.blockOnMouseDown!.y, block.y);
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          this.cache.grid.setAt(x, y, this.fillType);
        }
      }
    }
  }

  public onMouseDown(block: BlockData) {

    // make a copy of grid to revert to whenever mouse is moved so that fill can be applied again
    this.oldGrid = this.cache.grid.copy();

    this.blockOnMouseDown = block;
    this.fillType = this.cache.grid.at(block.x, block.y) === BlockType.FILLED ? BlockType.EMPTY : BlockType.FILLED;
    this.cache.grid.setAt(block.x, block.y, this.fillType);
    this.mouseDown = true;

    // listen for mouse up globally
    this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.onGlobalMouseUp.bind(this));

  }

  public onGlobalMouseUp() {
    this.mouseDown = false;

    if (!this.hoveringOverBoard) {
      this.cache.grid = this.oldGrid!;
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

  public async onAnalysis() {

    console.log("analyzing");
    console.log(this.cache);


    const status = new GameStatus(this.cache.level, 110, 123456);
    const position = new GamePosition(status, this.cache.grid, this.cache.currentPieceType, this.cache.nextPieceType);
    
    const recommendations = await this.evaluatorService.evaluatePosition(position, HZ_10);
    console.log(recommendations);
  }

}
