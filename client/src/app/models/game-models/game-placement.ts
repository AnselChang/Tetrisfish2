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
import PlacementAnalysis from "./placement-analysis";

export class GamePlacement {

    // stores all the optional analysis data from SR for this placement
    public readonly analysis = new PlacementAnalysis();

    constructor(
        public grid: BinaryGrid, // DOES NOT INCLUDE CURRENT PIECE
        public currentPieceType: TetrominoType, // type of the current piece to be placed
        public nextPieceType: TetrominoType, // type of the next box piece
        public status: GameStatus | undefined, // status of the game AFTER the placement
        public piecePlacement: MoveableTetromino | undefined, // compact way to store the pose of the current piece
    ) {}

    hasPlacement(): boolean {
        return this.piecePlacement !== undefined;
    }

    setPlacement(piecePlacement: MoveableTetromino, statusAfterPlacement: GameStatus) {
        this.piecePlacement = piecePlacement;
        this.status = statusAfterPlacement;
    }

    // create a grid that includes the current piece
    getGridWithPlacement(): BinaryGrid {

        if (!this.hasPlacement()) throw new Error("No piece placement");

        // make a copy of the grid without placement to modify it
        const gridWithPiece = this.grid.copy();

        // add the current piece to the grid
        this.piecePlacement!.getCurrentBlockSet().blocks.forEach(block => {
            gridWithPiece.setAt(block.x, block.y, BlockType.FILLED);
        });

        return gridWithPiece;

    }


}