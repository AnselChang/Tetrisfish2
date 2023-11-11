import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output } from '@angular/core';
import { BlockData, BlockMode, TetrisBoardMode } from '../interactive-tetris-board/interactive-tetris-board.component';
import { TetrominoColorType, getColorForLevel } from 'client/src/app/models/tetronimo-models/tetromino';

enum BlockFillType {
  SOLID = "SOLID",
  BORDER = "BORDER",
  NONE = "NONE"
}

/*
Draws a single tetris block on the tetris board
*/

@Component({
  selector: '[app-tetris-block]',
  templateUrl: './tetris-block.component.html',
  styleUrls: ['./tetris-block.component.scss']
})
export class TetrisBlockComponent implements OnInit, OnChanges {
  @Input() mode!: TetrisBoardMode;
  @Input() blockData!: BlockData;
  @Input() showHovering: boolean = false;
  @Output() onHover = new EventEmitter<boolean>();
  @Output() onClick = new EventEmitter<void>();
  @Output() onMouseDown = new EventEmitter<void>();
  @Output() onMouseUp = new EventEmitter<void>();

  public isHovering: boolean = false;

  public type: BlockFillType = BlockFillType.SOLID;
  public whiteColor = "white";
  public mainColor = "white";
  
  public get BlockFillType(): typeof BlockFillType {
    return BlockFillType;
  }

  ngOnInit(): void {
      this.calculateColors();
  }

  ngOnChanges(): void {
    this.calculateColors();
  }

  private calculateColors(): void {

    // if no color, no block
    if (this.blockData.color === undefined) {
      this.type = BlockFillType.NONE;
      return;
    }

    this.type = (this.blockData.color === TetrominoColorType.COLOR_WHITE) ? BlockFillType.BORDER : BlockFillType.SOLID;

    let mainColorType;
    if (this.blockData.color === TetrominoColorType.COLOR_WHITE) {
      mainColorType = this.blockData.mode !== BlockMode.NORMAL ? TetrominoColorType.COLOR_SECOND : TetrominoColorType.COLOR_FIRST;
    } else {
      mainColorType = this.blockData.color;
    }

    this.mainColor = getColorForLevel(mainColorType, this.blockData.level);
  }

  public isNextPiece(): boolean {
    return this.blockData.mode === BlockMode.NEXT_PIECE;
  }

  @HostListener('mouseover') onMouseOver() {
    this.onHover.emit(true);
    if (this.mode === TetrisBoardMode.MOVEABLE_CURRENT_PIECE) {
      this.isHovering = true;
    }
  }

  @HostListener('mouseout') onMouseOut() {
    this.onHover.emit(false);
    this.isHovering = false;
  }

  @HostListener('click') onBlockClick() {
    this.onClick.emit();
  }

  @HostListener('mousedown') onBlockMouseDown() {
    this.onMouseDown.emit();
  }

  @HostListener('mouseup') onBlockMouseUp() {
    this.onMouseUp.emit();
  }


  // for solid blocks, get the four white pixel locations
  public getWhiteLocations(): {x: number, y: number}[] {
    return [
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 1, y: 2},
      {x: 2, y: 1}
    ];
  }
}
