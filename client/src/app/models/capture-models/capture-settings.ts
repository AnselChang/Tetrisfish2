/*
Represents all the state for a frame after OCR
*/

import BinaryGrid from "../tetronimo-models/binary-grid";
import { Tetromino, TetrominoType } from "../tetronimo-models/tetromino";
import { BoardOCRBox, LevelOCRBox, LinesOCRBox, NextOCRBox } from "./ocr-box";
import { Point } from "./point";

export type Rectangle = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};

export enum ThresholdType {
    MINO = "MINO",
    TEXT = "TEXT"
}

export class Threshold {
    constructor(public value: number, public min: number, public max: number) {}
}

export class CaptureSettings {

    public threshold: number = 5; 

    public thresholds = {
        [ThresholdType.MINO]: new Threshold(5, 0, 30), // the hsv value threshold for detecting a mino
        [ThresholdType.TEXT]: new Threshold(70, 0, 100) // the hsv value threshold for detecting text
    };

    private boardOCRBox?: BoardOCRBox;
    private nextOCRBox?: NextOCRBox;
    private levelOCRBox?: LevelOCRBox;
    private linesOCRBox?: LevelOCRBox;

    public setBoardBoundingRect(boundingRect: Rectangle) {
        this.boardOCRBox = new BoardOCRBox(this, boundingRect);
    }

    public setNextBoundingRect(boundingRect: Rectangle) {
        this.nextOCRBox = new NextOCRBox(this, boundingRect);
    }

    public setLevelBoundingRect(boundingRect: Rectangle) {
        this.levelOCRBox = new LevelOCRBox(this, boundingRect);
    }

    public setLinesBoundingRect(boundingRect: Rectangle) {
        this.linesOCRBox = new LinesOCRBox(this, boundingRect);
    }

    public getNext(): NextOCRBox | undefined {
        return this.nextOCRBox;
    }

    public getBoard(): BoardOCRBox | undefined {
        return this.boardOCRBox;
    }

    public getLevel(): LevelOCRBox | undefined {
        return this.levelOCRBox;
    }

    public getLines(): LinesOCRBox | undefined {
        return this.linesOCRBox;
    }

}