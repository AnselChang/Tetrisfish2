/*
Represents all the state for a frame after OCR
*/

import GameStatus from "../tetromino-models/game-status";
import { TetrominoType } from "../tetromino-models/tetromino";
import BinaryGrid from "../game-models/binary-grid";
import { BoardOCRBox } from "./ocr-box";
import { Point } from "./point";

export type Rectangle = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};

export class CaptureSettings {

    public boardOCRBox?: BoardOCRBox;

    public setBoardBoundingRect(boundingRect: Rectangle) {
        this.boardOCRBox = new BoardOCRBox(boundingRect);
    }

    public getBoardBoundingRect(): Rectangle | undefined {
        if (!this.boardOCRBox) return undefined;
        return this.boardOCRBox?.getBoundingRect()!;
    }

    public getBoardPositions(): Point[][] | undefined {
        if (!this.boardOCRBox) return undefined;
        return this.boardOCRBox?.getPositions();
    }

}