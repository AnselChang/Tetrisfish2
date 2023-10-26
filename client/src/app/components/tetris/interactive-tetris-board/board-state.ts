/*
Represents the board state, including the score, level, lines, grid, current piece type, and next piece type.
Passed into the interactive tetris board component.
*/

import BinaryGrid from "../../../models/mutable-tetris-models/binary-grid";
import GameStatus from "../../../models/immutable-tetris-models/game-status";
import { TetrominoType } from "../../../models/immutable-tetris-models/tetromino";

export default class BoardState {
    constructor(
        public level: number,
        public grid: BinaryGrid,
        public currentPieceType: TetrominoType,
        public nextPieceType: TetrominoType
    ) {}
}