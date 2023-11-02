/*
Represents all the state for a frame after OCR
*/

import BinaryGrid from "../tetronimo-models/binary-grid";
import { Tetromino, TetrominoType } from "../tetronimo-models/tetromino";
import { BoardOCRBox, NextOCRBox } from "./ocr-box";
import { Point } from "./point";

export type Rectangle = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};

export class CaptureSettings {

    public threshold: number = 5; // the hsv value (0-100) threshold for detecting a mino
    public boardOCRBox?: BoardOCRBox;
    public nextOCRBox?: NextOCRBox;

    public setBoardBoundingRect(boundingRect: Rectangle) {
        this.boardOCRBox = new BoardOCRBox(this, boundingRect);
    }

    public setNextBoundingRect(boundingRect: Rectangle) {
        this.nextOCRBox = new NextOCRBox(this, boundingRect);
    }

    public getNext(): NextOCRBox | undefined {
        return this.nextOCRBox;
    }

    public getNextPiece(): TetrominoType {
        return TetrominoType.I_TYPE;
    }

    public getNextBoundingRect(): Rectangle | undefined {
        if (!this.nextOCRBox) return undefined;
        return this.nextOCRBox?.getBoundingRect()!;
    }

    public getNextPositions(): Point[][] | undefined {
        if (!this.nextOCRBox) return undefined;
        return this.nextOCRBox?.getPositions();
    }

    public getBoardBoundingRect(): Rectangle | undefined {
        if (!this.boardOCRBox) return undefined;
        return this.boardOCRBox?.getBoundingRect()!;
    }

    public getBoardPositions(): Point[][] | undefined {
        if (!this.boardOCRBox) return undefined;
        return this.boardOCRBox?.getPositions();
    }

    public getBoard(): BoardOCRBox | undefined {
        return this.boardOCRBox;
    }

    public getGrid(): BinaryGrid | undefined {
        if (!this.boardOCRBox) return undefined;
        return this.boardOCRBox?.getGrid();
    }

}