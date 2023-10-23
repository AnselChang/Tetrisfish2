/*
Represents a raw frame of game state data, as recieved from the feed.
Useful for replays
*/

import GameStatus from "../immutable-tetris-models/game-status";
import { TetrominoType } from "../immutable-tetris-models/tetromino";
import BinaryGrid from "../mutable-tetris-models/binary-grid";

class GameFrame {
    
    constructor(
        public status: GameStatus,
        public grid: BinaryGrid,
        public nextPieceType: TetrominoType
    ) {}

}