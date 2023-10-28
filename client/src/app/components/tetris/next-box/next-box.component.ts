import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BlockPosition, BlockSet } from 'client/src/app/models/immutable-tetris-models/block';
import { TetrominoColorType, TetrominoNB, TetrominoType, getColorForLevel, getColorTypeForTetromino } from 'client/src/app/models/immutable-tetris-models/tetromino';
import { BlockData, TetrisBoardMode } from '../interactive-tetris-board/interactive-tetris-board.component';
import { Block } from 'blockly';

@Component({
  selector: 'app-next-box',
  templateUrl: './next-box.component.html',
  styleUrls: ['./next-box.component.scss']
})
export class NextBoxComponent {
  @Input() level: number = 18;
  @Input() type?: TetrominoType = TetrominoType.L_TYPE;
  @Input() SVG_PADDING = 4;
  @Input() showBackground: boolean = true;

  public SVG_BLOCK_SIZE = 8;
  public SVG_BLOCK_GAP = 1;

  public SVG_NB_WIDTH = this.SVG_BLOCK_SIZE + (this.SVG_BLOCK_SIZE + this.SVG_BLOCK_GAP) * 3 + this.SVG_PADDING * 2;
  public SVG_NB_HEIGHT = this.SVG_BLOCK_SIZE + (this.SVG_BLOCK_SIZE + this.SVG_BLOCK_GAP) * 1 + this.SVG_PADDING * 2;

  public SVG_NB_VIEW_BOX = `0 0 ${this.SVG_NB_WIDTH} ${this.SVG_NB_HEIGHT}`;
  
  public viewbox = this.SVG_NB_VIEW_BOX;
  public nbWidth = this.SVG_NB_WIDTH;
  public nbHeight = this.SVG_NB_HEIGHT;

  public TetrisBoardMode = TetrisBoardMode;

  public getBlockSet(): BlockSet {
    if (!this.type) return new BlockSet([]);
    
    return TetrominoNB.getPieceByType(this.type).blockSet;
  }

  public getBlockData(position: BlockPosition): BlockData {
    const WHITE_COLOR = getColorForLevel(TetrominoColorType.COLOR_WHITE);
    return new BlockData(position.x, position.y, this.SVG_PADDING, this.level, getColorTypeForTetromino(this.type!));
  }

}
