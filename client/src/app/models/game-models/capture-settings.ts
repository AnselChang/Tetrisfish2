/*
Represents all the state for a frame after OCR
*/

import GameStatus from "../immutable-tetris-models/game-status";
import { TetrominoType } from "../immutable-tetris-models/tetromino";
import BinaryGrid from "../mutable-tetris-models/binary-grid";

export type Rectangle = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};

export class CaptureSettings {

    public boardRect?: Rectangle;
    public nextRect?: Rectangle;

}