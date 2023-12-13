import { Component, Renderer2 } from '@angular/core';
import { BlockData, TetrisBoardMode } from '../../../tetris/interactive-tetris-board/interactive-tetris-board.component';
import { BoardCreationCacheService } from 'client/src/app/services/board-creation-cache.service';
import BinaryGrid, { BlockType } from 'client/src/app/models/tetronimo-models/binary-grid';
import GameStatus from 'client/src/app/models/tetronimo-models/game-status';
import { fetchMovelist } from 'client/src/app/scripts/evaluation/evaluator';
import { GamePlacement } from 'client/src/app/models/game-models/game-placement';
import { SmartGameStatus } from 'client/src/app/models/tetronimo-models/smart-game-status';
import { TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';
import { MLPlacement, SRRawEvalResponse, MLDataPoint } from 'client/src/app/machine-learning/ml-placement';
import MoveableTetromino from 'client/src/app/models/game-models/moveable-tetromino';
import { BestMoveResponse } from 'client/src/app/ai/abstract-ai-adapter/best-move-response';
import { findForcedBurnLines } from 'client/src/app/machine-learning/find-forced-burn-rows';

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

  public burnRows: number[] = [];


  constructor(private renderer: Renderer2, public cache: BoardCreationCacheService
    ) {}

  private onBoardChange() {
    this.burnRows = findForcedBurnLines(this.cache.grid);
  }
  
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

      this.onBoardChange();
    }
  }

  public onMouseDown(block: BlockData) {

    // reset ml object
    this.cache.ml = undefined;

    // make a copy of grid to revert to whenever mouse is moved so that fill can be applied again
    this.oldGrid = this.cache.grid.copy();

    this.blockOnMouseDown = block;
    this.fillType = this.cache.grid.at(block.x, block.y) === BlockType.FILLED ? BlockType.EMPTY : BlockType.FILLED;
    this.cache.grid.setAt(block.x, block.y, this.fillType);
    this.mouseDown = true;

    this.onBoardChange();

    // listen for mouse up globally
    this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.onGlobalMouseUp.bind(this));

  }

  public onGlobalMouseUp() {
    this.mouseDown = false;

    if (!this.hoveringOverBoard) {
      this.cache.grid = this.oldGrid!;
      this.onBoardChange();
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

  public printBoard() {
    console.log(this.cache.grid._getAsString());
  }

  public getNextTetrominoType(currentType: TetrominoType): TetrominoType {
    // Convert the enum values to an array
    const types = Object.values(TetrominoType);

    // Find the index of the current type in the array
    const currentIndex = types.indexOf(currentType);

    // Calculate the index of the next type. If the current type is the last one, wrap to 0.
    const nextIndex = (currentIndex + 1) % types.length;

    // Return the next type
    return types[nextIndex];
  }

  public async toggleFirstPiece() {
    this.cache.currentPieceType = this.getNextTetrominoType(this.cache.currentPieceType);
  }

  public async toggleSecondPiece() {
    this.cache.nextPieceType = this.getNextTetrominoType(this.cache.nextPieceType);
  }

  public async onAnalysis() {
    this.cache.ml = new MLPlacement(this.cache.grid, this.cache.currentPieceType, this.cache.nextPieceType);
    await this.cache.ml.runSRBestMove();
    await this.cache.ml.runSRRawEval(18);
  }

  public getRawSRResponse(): SRRawEvalResponse | undefined {
    return this.cache.ml?.getRawEvalResponse();
  }

  public getEngineResponse(): BestMoveResponse | undefined {
    return this.cache.ml?.getEngineResponse();
  }

  public getDataPointString(): string | undefined {
    const dp = this.cache.ml?.getDataPoint();
    return dp ? JSON.stringify(dp) : undefined;
  }

  public isBoardValidForML(): boolean {
    return this.cache.ml?.isBoardValidForML() ?? false;
  }

  public getBestFirstPiece(): MoveableTetromino | undefined {
    return this.getEngineResponse()?.currentPlacement;
  }

  public getBestSecondPiece(): MoveableTetromino | undefined {
    return this.getEngineResponse()?.nextPlacement;
  }

}
