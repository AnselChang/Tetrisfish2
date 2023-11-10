/*
Represents the game state for one placement of a tetromino on the board, involving
the board, the placement, and the current/next pieces
Useful for analysis, puzzle generation, etc.
*/

import GameStatus from "../tetronimo-models/game-status";
import { TetrominoType } from "../tetronimo-models/tetromino";
import BinaryGrid, { BlockType } from "../tetronimo-models/binary-grid";
import MoveableTetromino from "./moveable-tetromino";
import { Block } from "blockly";

export class GamePlacement {

    constructor(
        public status: GameStatus,
        public grid: BinaryGrid, // DOES NOT INCLUDE CURRENT PIECE
        public piecePlacement: MoveableTetromino, // compact way to store the pose of the current piece
        public nextPieceType: TetrominoType // type of the next box piece
    ) {}

    // create a grid that includes the current piece
    getGridWithPlacement(): BinaryGrid {

        // make a copy of the grid without placement to modify it
        const gridWithPiece = this.grid.copy();

        // add the current piece to the grid
        this.piecePlacement.getCurrentBlockSet().blocks.forEach(block => {
            gridWithPiece.setAt(block.x, block.y, BlockType.FILLED);
        });

        return gridWithPiece;

    }


}