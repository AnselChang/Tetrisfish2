/*
Represents the game state for one placement of a tetromino on the board, involving
the board, the placement, and the current/next pieces
Useful for analysis, puzzle generation, etc.
*/

import GameStatus from "../immutable-tetris-models/game-status";
import { TetrominoType } from "../immutable-tetris-models/tetromino";
import BinaryGrid from "../mutable-tetris-models/binary-grid";
import MoveableTetromino from "../mutable-tetris-models/moveable-tetromino";

class GamePlacement {

    constructor(
        public status: GameStatus,
        public grid: BinaryGrid, // DOES NOT INCLUDE CURRENT PIECE
        public piecePlacement: MoveableTetromino, // compact way to store the pose of the current piece
        public nextPieceType: TetrominoType // type of the next box piece
    ) {}

}