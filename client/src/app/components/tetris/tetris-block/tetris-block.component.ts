import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { BlockData, BlockFillType, TetrisBoardMode } from '../interactive-tetris-board/interactive-tetris-board.component';
import { block } from 'core/tooltip';

/*
Draws a single tetris block on the tetris board
*/

@Component({
  selector: '[app-tetris-block]',
  templateUrl: './tetris-block.component.html',
  styleUrls: ['./tetris-block.component.scss']
})
export class TetrisBlockComponent {
  @Input() mode!: TetrisBoardMode;
  @Input() blockData!: BlockData;
  @Output() onHover = new EventEmitter<boolean>();
  @Output() onClick = new EventEmitter<void>();

  public isHovering: boolean = false;
  
  public get BlockFillType(): typeof BlockFillType {
    return BlockFillType;
  }

  @HostListener('mouseover') onMouseOver() {
    this.onHover.emit(true);
    if (this.mode === TetrisBoardMode.INTERACTIVE) {
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
