import BinaryGrid from "../tetronimo-models/binary-grid";
import { TetrominoType } from "../tetronimo-models/tetromino";
import MoveableTetromino from "./moveable-tetromino";

export interface BasePlacement {
    getBoard(): BinaryGrid;
    getMTPlacement(): MoveableTetromino;
    getNextType(): TetrominoType;
}