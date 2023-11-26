import { Component, Host, HostListener, Input, OnInit } from '@angular/core';
import { Puzzle } from '../../models/puzzle';
import MoveableTetromino from '../../models/game-models/moveable-tetromino';
import { BlockData } from '../tetris/interactive-tetris-board/interactive-tetris-board.component';
import BinaryGrid from '../../models/tetronimo-models/binary-grid';
import { Tetromino, TetrominoType } from '../../models/tetronimo-models/tetromino';

export enum Status {
  PLACING_FIRST_PIECE,
  PLACING_SECOND_PIECE,
  FINISHED_PLACING_PIECES,
}

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.scss']
})
export class PuzzleComponent implements OnInit {
  @Input() puzzle!: Puzzle;

  private defaultCurrentPiece?: MoveableTetromino;
  private defaultNextPiece?: MoveableTetromino;

  private hoveringPiece?: MoveableTetromino;
  public isHoveringPieceValid: boolean = false;

  private placedCurrentPiece?: MoveableTetromino;
  private placedNextPiece?: MoveableTetromino;

  private status: Status = Status.PLACING_FIRST_PIECE;

  public currentGrid!: BinaryGrid;
  private rotation: number = 0;

  private lastX: number = 0;
  private lastY: number = 0;

  constructor() {
  }

  ngOnInit(): void {
      
    // initialize current piece to top of the board
    this.defaultCurrentPiece = new MoveableTetromino(this.puzzle.firstPieceSolution.tetrominoType, 0, 3, 0);
    this.defaultNextPiece = new MoveableTetromino(this.puzzle.secondPieceSolution.tetrominoType, 0, 3, 0);

    this.currentGrid = this.puzzle.grid.copy();

  }

  getDisplayPiece(): MoveableTetromino | undefined {

    if (this.status === Status.FINISHED_PLACING_PIECES) return undefined;

    if (this.hoveringPiece) return this.hoveringPiece;

    if (this.status === Status.PLACING_FIRST_PIECE) {
      return this.defaultCurrentPiece;

    } else if (this.status === Status.PLACING_SECOND_PIECE) {
      return this.defaultNextPiece;
    }
  
    return undefined;
  }

  private getOffset(type: TetrominoType, rot: number): {x: number, y: number} {

    rot %= Tetromino.getPieceByType(type).numPossibleRotations();

    if (type === TetrominoType.I_TYPE && rot === 1) return {x: 1, y: -2};
    else if (type === TetrominoType.J_TYPE || type === TetrominoType.L_TYPE) {
      if (rot === 1 || rot == 2) return {x: 0, y: -1};
      else if (rot === 3) return {x: 1, y: -1};
    } else if (type === TetrominoType.T_TYPE) {
      if (rot === 1) return {x: 0, y: -1};
      else if (rot === 2) return {x: 0, y: -1};
      else if (rot === 3) return {x: 1, y: -1};
      else if (rot === 2) return {x: 0, y : -1};
    } else if (type === TetrominoType.S_TYPE) {
      
    } else if (type === TetrominoType.Z_TYPE) {
      
    } else { // O_TYPE

    }


    return {x: 0, y: 0};
  }

  private setHoveringPiece(type: TetrominoType, block?: BlockData) {

    if (block) {
      this.lastX = block.x;
      this.lastY = block.y;
    }
    
    const {x, y} = this.getOffset(type, this.rotation);
    this.hoveringPiece = new MoveableTetromino(type, this.rotation, this.lastX + x - 1, this.lastY + y);
    this.hoveringPiece.moveToBounds();
    const valid = this.hoveringPiece.kickToValidPosition(this.currentGrid);
    if (!valid) this.hoveringPiece.kickToNonIntersectingPosition(this.currentGrid);
    this.isHoveringPieceValid = this.hoveringPiece.isValidPlacement(this.currentGrid);
  }

  setHoveredBlock(block?: BlockData) {

    if (!block) {
      this.hoveringPiece = undefined;
      return;
    }
    const type = (this.status === Status.PLACING_FIRST_PIECE) ? this.puzzle.firstPieceSolution.tetrominoType : this.puzzle.secondPieceSolution.tetrominoType;
    this.setHoveringPiece(type, block);

  }

  // lock the hovered piece in place if it is valid
  onBoardClick(block?: BlockData) {

    // if no hovering piece, do nothing
    if (!this.hoveringPiece || this.status === Status.FINISHED_PLACING_PIECES) return;

    // if not valid placement, do nothing
    if (!this.hoveringPiece.isValidPlacement(this.currentGrid)) return;

    // lock the piece in
    this.hoveringPiece.blitToGrid(this.currentGrid);
    this.currentGrid.processLineClears();
    if (this.status === Status.PLACING_FIRST_PIECE) {
      this.placedCurrentPiece = this.hoveringPiece;
      this.status = Status.PLACING_SECOND_PIECE;

      // set next hovered piece
      if (!block) this.hoveringPiece = undefined;
      else {
        this.setHoveringPiece(this.puzzle.secondPieceSolution.tetrominoType, block);
      }
    } else {
      this.placedNextPiece = this.hoveringPiece;
      this.status = Status.FINISHED_PLACING_PIECES;
      this.hoveringPiece = undefined;
    }
  }

  // if r key placed, rotate the hovering piece
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'r') this.rotatePiece(1);
    else if (event.key === 'e') this.rotatePiece(-1);
    else if (event.key === 'Space') this.submitPuzzle();
    else if (event.key === 'q') this.resetPuzzle();
  }

  rotatePiece(direction: number = 1) {
    if (this.hoveringPiece) {
      this.rotation += direction;
      this.setHoveringPiece(this.hoveringPiece.tetrominoType);
    }
  }

  resetPuzzle() {
    this.currentGrid = this.puzzle.grid.copy();
    this.status = Status.PLACING_FIRST_PIECE;
    this.hoveringPiece = undefined;
    this.placedCurrentPiece = undefined;
    this.placedNextPiece = undefined;
    this.rotation = 0;
  }

  submitPuzzle() {

    if (this.status !== Status.FINISHED_PLACING_PIECES) return;

    if (
      this.puzzle.firstPieceSolution.equals(this.placedCurrentPiece!) &&
      this.puzzle.secondPieceSolution.equals(this.placedNextPiece!)
    ) {
      alert("Correct!");
    } else {
      alert("Incorrect");
    }

  }

}