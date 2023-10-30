/*
Represents all the state for a frame after OCR
*/

import GameStatus from "../immutable-tetris-models/game-status";
import { TetrominoType } from "../immutable-tetris-models/tetromino";
import BinaryGrid from "../mutable-tetris-models/binary-grid";


export class ExtractedState {

    // if no capture, then all fields are set to default values
    public status: GameStatus = new GameStatus(0, 0, 0);
    public grid: BinaryGrid = new BinaryGrid();
    public nextPieceType?: TetrominoType = undefined;
    
    constructor(
        status?: GameStatus,
        grid?: BinaryGrid,
        nextPieceType?: TetrominoType
    ) {
        if (status) {
            this.status = status;
        }
        if (grid) {
            this.grid = grid;
        }
        if (nextPieceType) {
            this.nextPieceType = nextPieceType;
        }
    }

}