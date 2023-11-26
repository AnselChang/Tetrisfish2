import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import MoveableTetromino from 'client/src/app/models/game-models/moveable-tetromino';
import BinaryGrid, { BlockType } from 'client/src/app/models/tetronimo-models/binary-grid';
import { TetrominoColorType, getColorTypeForTetromino } from 'client/src/app/models/tetronimo-models/tetromino';

/*
An interactable tetris board.
If mode is MOVEABLE_CURRENT_PIECE, can move current piece around.
*/

export enum TetrisBoardMode {
  READONLY = "READONLY",
  MOVEABLE_CURRENT_PIECE = "MOVEABLE_CURRENT_PIECE", // can move current piece around
}

const SVG_BLOCK_SIZE = 8;
const SVG_BLOCK_GAP = 1;
const SVG_PADDING = 1;

const SVG_BOARD_WIDTH = SVG_BLOCK_SIZE + (SVG_BLOCK_SIZE + SVG_BLOCK_GAP) * 9 + SVG_PADDING * 2;
const SVG_BOARD_HEIGHT = SVG_BLOCK_SIZE + (SVG_BLOCK_SIZE + SVG_BLOCK_GAP) * 19 + SVG_PADDING * 2;

export enum BlockMode {
  NORMAL = "NORMAL",
  THIS_PIECE = "THIS_PIECE",
  NEXT_PIECE = "NEXT_PIECE",
}

export class BlockData {
  public readonly svgX: number;
  public readonly svgY: number;
  public readonly svgSize: number;

  constructor(
    public readonly x: number,
    public readonly y: number,
    padding: number,
    public readonly level: number,
    public readonly color?: TetrominoColorType,
    public readonly mode: BlockMode = BlockMode.NORMAL, // if color is white and special, display the other border color
    public readonly opacity?: number
  ) {
    this.svgSize = SVG_BLOCK_SIZE;
    this.svgX = (this.x) * (SVG_BLOCK_SIZE + SVG_BLOCK_GAP) + padding;
    this.svgY = (this.y) * (SVG_BLOCK_SIZE + SVG_BLOCK_GAP) + padding;
  }
}

@Component({
  selector: 'app-interactive-tetris-board',
  templateUrl: './interactive-tetris-board.component.html',
  styleUrls: ['./interactive-tetris-board.component.scss']
})
export class InteractiveTetrisBoardComponent {
  @Input() mode = TetrisBoardMode.READONLY;
  @Input() level: number = 18;
  @Input() grid: BinaryGrid | undefined;
  @Input() paused: boolean = false;
  @Input() greyOut: number = 0;

  // two-way binding for current piece
  // use syntax [(currentPiece)]="currentPiece" in parent template
  // if current piece is undefined, no piece is displayed but hovering over the board
  // will hover the piece at the mouse location
  @Input() currentPiece?: MoveableTetromino;
  @Output() currentPieceChange = new EventEmitter<MoveableTetromino | undefined>();
  @Input() currentPieceOpacity?: number;

  @Input() nextPiece?: MoveableTetromino;


  @Output() hoveredBlock = new EventEmitter<BlockData>();
  @Output() onHoverOff = new EventEmitter<void>();
  @Output() onClick = new EventEmitter<BlockData>();
  @Output() onMouseDown = new EventEmitter<BlockData>();
  @Output() onMouseUp = new EventEmitter<BlockData>();

  readonly VIEW_BOX = `0 0 ${SVG_BOARD_WIDTH} ${SVG_BOARD_HEIGHT}`;

  public readonly ZERO_TO_NINE: number[] = Array(10).fill(0).map((x, i) => i);
  public readonly ZERO_TO_NINETEEN: number[] = Array(20).fill(0).map((x, i) => i);
  
  public readonly PAUSE_X = SVG_BOARD_WIDTH / 2;
  public readonly PAUSE_Y = SVG_BOARD_HEIGHT / 3;
  public readonly PAUSE_SIZE = SVG_BOARD_WIDTH / 3;
  public readonly PAUSE_HEIGHT_OVER_WIDTH = 60/270;
  
  public get boardWidth(): number {
    return SVG_BOARD_WIDTH;
  }

  public get boardHeight(): number {
    return SVG_BOARD_HEIGHT;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.onHoverOff.emit();
  }

  public onBlockHover(block: BlockData ,isHovering: boolean) {
    if (isHovering) this.hoveredBlock.emit(block);
  }

  public onBlockClick(block: BlockData) {
    this.onClick.emit(block);
  }

  public onBlockMouseDown(block: BlockData) {
    this.onMouseDown.emit(block);
  }

  public onBlockMouseUp(block: BlockData) {
    this.onMouseUp.emit(block);
  }

  // most blocks are white, except for the current piece
  // if current piece is white, the border is a different color to diffeentiate
  public getBlockAt(x: number, y: number): BlockData | null {
    // type is "SOLID" for solid design if mostly mainColor, "BORDER" for mostly whiteColor with mainColor border 

    let colorType;
    let opacity = undefined;
    let mode: BlockMode = BlockMode.NORMAL;
    if (this.currentPiece && this.currentPiece.isAtLocation(x,y)) {
      colorType = getColorTypeForTetromino(this.currentPiece.tetrominoType);
      mode = BlockMode.THIS_PIECE;
      opacity = this.currentPieceOpacity;
    } else if (this.nextPiece && this.nextPiece.isAtLocation(x,y)) {
      colorType = getColorTypeForTetromino(this.nextPiece.tetrominoType);
      mode = BlockMode.NEXT_PIECE;
    } else if (this.grid && this.grid.at(x, y) === BlockType.FILLED) {
      colorType = TetrominoColorType.COLOR_WHITE;
    } else {
      return new BlockData(x, y, SVG_PADDING, this.level, undefined); // no block to display
    }

    return new BlockData(
      x, y,
      SVG_PADDING,
      this.level,
      colorType,
      mode,
      opacity
    );
  }

  public getPauseX(): number {
    return this.PAUSE_X - this.getPauseWidth() / 2;
  }
  public getPauseY(): number {
    return this.PAUSE_Y - this.getPauseHeight() / 2;
  }
  public getPauseWidth(): number {
    return this.PAUSE_SIZE;
  }
  public getPauseHeight(): number {
    return this.PAUSE_SIZE*this.PAUSE_HEIGHT_OVER_WIDTH;
  }


}
