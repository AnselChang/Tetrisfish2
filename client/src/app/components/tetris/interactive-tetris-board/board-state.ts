/*
Represents the board state, including the score, level, lines, grid, current piece type, and next piece type.
*/

import BinaryGrid from "../mutable-tetris-models/binary-grid";
import GameStatus from "../immutable-tetris-models/game-status";
import { TetrominoType } from "../immutable-tetris-models/tetromino";

export default class BoardState {
    constructor(
        public status: GameStatus,
        public grid: BinaryGrid,
        public currentPieceType: TetrominoType,
        public nextPieceType: TetrominoType
    ) {}
}