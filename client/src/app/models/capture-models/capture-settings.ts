/*
Represents all the state for a frame after OCR
*/

import { BoardOCRBox } from "./ocr-box";
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

    public setBoardBoundingRect(boundingRect: Rectangle) {
        this.boardOCRBox = new BoardOCRBox(this, boundingRect);
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

}