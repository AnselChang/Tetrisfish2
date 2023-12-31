import { Component, Host, HostListener, Input, OnInit } from '@angular/core';
import { Puzzle } from '../../models/puzzle';
import MoveableTetromino from '../../models/game-models/moveable-tetromino';
import { BlockData } from '../tetris/interactive-tetris-board/interactive-tetris-board.component';
import BinaryGrid from '../../models/tetronimo-models/binary-grid';
import { Tetromino, TetrominoType } from '../../models/tetronimo-models/tetromino';
import TagAssigner, { SimplePlacement } from '../../models/tag-models/tag-assigner';

export enum Status {
  PLACING_FIRST_PIECE,
  PLACING_SECOND_PIECE,
  FINISHED_PLACING_PIECES,
}

export enum Outcome {
  CORRECT,
  INCORRECT,
  INCOMPLETE,

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
  private lastBlock?: BlockData;

  private outcome = Outcome.INCOMPLETE;

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
      return {x: 0, y: -1};
    } else if (type === TetrominoType.Z_TYPE) {
      if (rot === 0) return {x: 0, y: -1};
      else  return {x: 1, y: -1};
    } else { // O_TYPE
      return {x: 1, y: -1};
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

    this.lastBlock = block;

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
    console.log(event.key);
    if (event.key === 'r') this.rotatePiece(1);
    if (event.key === 'w') this.undoPuzzle();
    else if (event.key === 'e') this.rotatePiece(3);
    else if (event.key === ' ') this.submitPuzzle();
    else if (event.key === 'q') this.resetPuzzle();
  }

  rotatePiece(amount: number = 1) {
    this.rotation += amount;
    if (this.hoveringPiece) this.setHoveringPiece(this.hoveringPiece.tetrominoType);
  }

  resetPuzzle() {
    this.outcome = Outcome.INCOMPLETE;
    this.currentGrid = this.puzzle.grid.copy();
    this.status = Status.PLACING_FIRST_PIECE;
    this.placedCurrentPiece = undefined;
    this.placedNextPiece = undefined;
    this.rotation = 0;
    this.hoveringPiece = undefined;
  }

  undoPuzzle() {
    if (this.status === Status.PLACING_FIRST_PIECE) return;
    if (this.status === Status.PLACING_SECOND_PIECE) this.resetPuzzle();
    else { // undo to after placing first piece
      this.outcome = Outcome.INCOMPLETE;
      this.status = Status.PLACING_SECOND_PIECE;
      this.hoveringPiece = undefined;
      this.placedNextPiece = undefined;
      this.rotation = 0;

      // reset to after placing first piece
      this.currentGrid = this.puzzle.grid.copy();
      this.placedCurrentPiece!.blitToGrid(this.currentGrid);
      this.currentGrid.processLineClears();
    }
  }

  submitPuzzle() {

    if (this.status !== Status.FINISHED_PLACING_PIECES) {
      this.onBoardClick(this.lastBlock);
      return;
    }

    if (
      this.puzzle.firstPieceSolution.equals(this.placedCurrentPiece!) &&
      this.puzzle.secondPieceSolution.equals(this.placedNextPiece!)
    ) {
      this.outcome = Outcome.CORRECT;
    } else {
      this.outcome = Outcome.INCORRECT;
    }

    console.log(`Current piece: r=${this.placedCurrentPiece!.getRotation()}, x=${this.placedCurrentPiece!.getTranslateX()}, y=${this.placedCurrentPiece!.getTranslateY()}`);
    console.log(`Next piece: r=${this.placedNextPiece!.getRotation()}, x=${this.placedNextPiece!.getTranslateX()}, y=${this.placedNextPiece!.getTranslateY()}`);

    const tags = TagAssigner.assignTagsFor(new SimplePlacement(this.puzzle.grid, this.placedCurrentPiece!, this.placedNextPiece!));
    console.log(tags);

  }

  getOutcomeColor(): string | undefined {
    if (this.outcome === Outcome.CORRECT) return "#58D774";
    if (this.outcome === Outcome.INCORRECT) return "#D75858";
    return undefined;
  }

  getPuzzleTitle(): string {
    let title = this.puzzle.getTitleString();
    if (this.outcome === Outcome.CORRECT) title += ": Correct";
    else if (this.outcome === Outcome.INCORRECT) title += ": Incorrect";
    return title;
  }

}