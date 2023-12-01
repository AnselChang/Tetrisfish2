/*
Represents all the state for a frame after OCR
*/

import { Playstyle } from "../../misc/playstyle";
import { InputSpeed } from "../../scripts/evaluation/input-frame-timeline";
import { ExtractedStateService } from "../../services/capture/extracted-state.service";
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

    public inputSpeed: InputSpeed = InputSpeed.HZ_30;
    public playstyle: Playstyle = Playstyle.UNKNOWN;

    public threshold: number = 5; 

    public thresholds = {
        [ThresholdType.MINO]: new Threshold(5, 0, 30), // the hsv value threshold for detecting a mino
        [ThresholdType.TEXT]: new Threshold(70, 0, 100) // the hsv value threshold for detecting text
    };

    private boardOCRBox?: BoardOCRBox;
    private nextOCRBox?: NextOCRBox;
    private levelOCRBox?: LevelOCRBox;
    private linesOCRBox?: LevelOCRBox;

    constructor(private extractedState: ExtractedStateService) {}

    public isCalibrated(): boolean {
        return this.boardOCRBox !== undefined && this.nextOCRBox !== undefined && this.levelOCRBox !== undefined && this.linesOCRBox !== undefined;
    }

    public setBoardBoundingRect(boundingRect: Rectangle) {
        this.boardOCRBox = new BoardOCRBox(this.extractedState, this, boundingRect);
    }

    public setNextBoundingRect(boundingRect: Rectangle) {
        this.nextOCRBox = new NextOCRBox(this.extractedState, this, boundingRect);
    }

    public setLevelBoundingRect(boundingRect: Rectangle) {
        this.levelOCRBox = new LevelOCRBox(this.extractedState, this, boundingRect);
    }

    public setLinesBoundingRect(boundingRect: Rectangle) {
        this.linesOCRBox = new LinesOCRBox(this.extractedState, this, boundingRect);
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