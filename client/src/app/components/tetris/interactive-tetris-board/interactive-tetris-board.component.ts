import { Component, Input } from '@angular/core';
import BoardState from './board-state';
import CurrentPiece, { CurrentPieceState } from './current-piece';
import { BlockType } from '../mutable-tetris-models/binary-grid';
import { TetrominoColorType, getColorForLevel, getColorTypeForTetromino } from '../immutable-tetris-models/tetromino';
import { Block } from 'blockly';

/*
An interactable tetris board with interacable current piece and displayed next piece in next box
*/

export enum BlockFillType {
  SOLID,
  BORDER
}

const SVG_BLOCK_SIZE = 8;
const SVG_BLOCK_GAP = 1;
const SVG_PADDING = 1;

const SVG_BOARD_WIDTH = SVG_BLOCK_SIZE + (SVG_BLOCK_SIZE + SVG_BLOCK_GAP) * 9 + SVG_PADDING * 2;
const SVG_BOARD_HEIGHT = SVG_BLOCK_SIZE + (SVG_BLOCK_SIZE + SVG_BLOCK_GAP) * 19 + SVG_PADDING * 2;

export class BlockData {
  public readonly svgX: number;
  public readonly svgY: number;
  public readonly svgSize: number;

  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly mainColor: string,
    public readonly whiteColor: string,
    public readonly type: BlockFillType
  ) {
    this.svgSize = SVG_BLOCK_SIZE;
    this.svgX = (this.x-1) * (SVG_BLOCK_SIZE + SVG_BLOCK_GAP) + SVG_PADDING;
    this.svgY = (this.y-1) * (SVG_BLOCK_SIZE + SVG_BLOCK_GAP) + SVG_PADDING;
  }
}

@Component({
  selector: 'app-interactive-tetris-board',
  templateUrl: './interactive-tetris-board.component.html',
  styleUrls: ['./interactive-tetris-board.component.scss']
})
export class InteractiveTetrisBoardComponent {
  @Input() boardState!: BoardState;
  @Input() currentPiece: CurrentPiece = new CurrentPiece(CurrentPieceState.NONE); // by default, show no current piece
  @Input() scale = 1; // pixels, default is 300. height is calculated to maintain aspect ratio

  
  readonly VIEW_BOX = `0 0 ${SVG_BOARD_WIDTH} ${SVG_BOARD_HEIGHT}`;

  public readonly ONE_TO_TEN: number[] = Array(10).fill(0).map((x, i) => i + 1);
  public readonly ONE_TO_TWENTY: number[] = Array(20).fill(0).map((x, i) => i + 1);

  public get boardWidthPixels(): number {
    return this.scale * SVG_BOARD_WIDTH;
  }

  public get boardHeightPixels(): number {
    return this.scale * SVG_BOARD_HEIGHT;
  }

  public getBlockAt(x: number, y: number): BlockData | null {
    // type is "SOLID" for solid design if mostly mainColor, "BORDER" for mostly whiteColor with mainColor border 

    const WHITE_COLOR = getColorForLevel(TetrominoColorType.COLOR_WHITE);

    let MAIN_COLOR, TYPE;
    if (this.boardState.grid.at(x, y) === BlockType.FILLED) {
      MAIN_COLOR = TetrominoColorType.COLOR_FIRST;
      TYPE = BlockFillType.BORDER;
    } 
    else if (this.currentPiece.state !== CurrentPieceState.NONE && this.currentPiece.tetromino!.isAtLocation(x,y)) {
      const colorType = getColorTypeForTetromino(this.currentPiece.tetromino!.tetromino.type);
      if (colorType === TetrominoColorType.COLOR_WHITE) { // if white is current piece, display white with different border color than usual scheme
        MAIN_COLOR = TetrominoColorType.COLOR_SECOND;
        TYPE = BlockFillType.BORDER;
      } else {
        MAIN_COLOR = colorType;
        TYPE = BlockFillType.SOLID;
      }
    }
    else {
      return null;
    }

    return new BlockData(
      x, y,
      getColorForLevel(MAIN_COLOR, this.boardState.status.level),
      WHITE_COLOR,
      TYPE
    );
  }


}
