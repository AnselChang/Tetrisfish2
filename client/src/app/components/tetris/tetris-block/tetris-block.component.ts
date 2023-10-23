import { Component, HostListener, Input, OnInit } from '@angular/core';
import { BlockData, BlockFillType } from '../interactive-tetris-board/interactive-tetris-board.component';
import { block } from 'core/tooltip';

/*
Draws a single tetris block on the tetris board
*/

@Component({
  selector: '[app-tetris-block]',
  templateUrl: './tetris-block.component.html',
  styleUrls: ['./tetris-block.component.scss']
})
export class TetrisBlockComponent implements OnInit {
  @Input() blockData!: BlockData;

  public isHovering: boolean = false;
  
  public get BlockFillType(): typeof BlockFillType {
    return BlockFillType;
  }

  ngOnInit(): void {
      console.log(this.blockData);
  }

  @HostListener('mouseover') onMouseOver() {
    this.isHovering = true;
  }

  @HostListener('mouseout') onMouseOut() {
    this.isHovering = false;
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
