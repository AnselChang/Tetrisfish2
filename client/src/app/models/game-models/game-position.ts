/*
Represents the game state for one placement of a tetromino on the board, involving
the board, the placement, and the current/next pieces
Useful for analysis, puzzle generation, etc.
*/

import GameStatus from "../immutable-tetris-models/game-status";
import { TetrominoType } from "../immutable-tetris-models/tetromino";
import BinaryGrid from "../mutable-tetris-models/binary-grid";
import MoveableTetromino from "../mutable-tetris-models/moveable-tetromino";

export class GamePosition {

    constructor(
        public status: GameStatus,
        public grid: BinaryGrid,
        public currentPieceType: TetrominoType, // type of the current piece to be placed
        public nextPieceType: TetrominoType // type of the next box piece
    ) {}

}