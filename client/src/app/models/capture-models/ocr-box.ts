/*
Stores a rectangle dimensions, and the specifications of the matrix within the rectangle
to OCR

For example, the ocr box for the main board should store relative positions of the
minos
*/

import { HSVColor, rgbToHsv } from "../../scripts/color";
import BinaryGrid, { BlockType } from "../tetronimo-models/binary-grid";
import { CaptureSettings, Rectangle } from "./capture-settings";
import { PixelReader } from "./pixel-reader";
import { Point } from "./point";

type SpecialPointsLocation = {
    [key: string]: Point
};

type SpecialPointsColor = {
    [key: string]: HSVColor
};


export class OCRBox {

    // all the canvas positions of the OCR matrixs
    // each position is (x,y)
    // pos[y][x]
    private positions: Point[][];
    private grid?: BinaryGrid;
    private specialPointsLocation: SpecialPointsLocation; // units in canvas pixels
    private specialPointsColor: SpecialPointsColor = {};

    private readonly HEIGHT: number;
    public readonly START_Y: number;
    private readonly WIDTH: number;
    public readonly START_X: number;

    constructor(
        private settings: CaptureSettings,
        public boundingRect: Rectangle,
        public numRows: number, // how many OCR dots to read vertically
        public paddingTop: number, // distance (in percent of height) before first OCR dot row
        public paddingBottom: number, // distance (in percent of height) after last OCR dot row
        public numCols: number, // how many OCR dots to read horizontally
        public paddingLeft: number, // distance (in percent of width) before first OCR dot column
        public paddingRight: number, // distance (in percent of width) after last OCR dot column
        specialPoints: SpecialPointsLocation = {} // special points to capture. units in percent of width/height
    ) {

        const boundingWidth = boundingRect.right - boundingRect.left;
        const boundingHeight = boundingRect.bottom - boundingRect.top;

        this.HEIGHT = boundingHeight * (1 - this.paddingTop - this.paddingBottom);
        this.START_Y = boundingRect.top + boundingHeight * this.paddingTop;

        this.WIDTH = boundingWidth * (1 - this.paddingLeft - this.paddingRight);
        this.START_X = boundingRect.left + boundingWidth * this.paddingLeft;

        this.positions = [];
        for (let yIndex = 0; yIndex < this.numRows; yIndex++) {
            let row: Point[] = [];

            const y = Math.floor(this.START_Y + this.HEIGHT * (yIndex / (this.numRows-1)));

            for (let xIndex = 0; xIndex < this.numCols; xIndex++) {
                const x = Math.floor(this.START_X + this.WIDTH * (xIndex / (this.numCols-1)));
                
                row.push({x, y});
            }
            this.positions.push(row);
        } 
        
        // convert special points from percent to pixels
        this.specialPointsLocation = {};
        for (const [key, point] of Object.entries(specialPoints)) {
            const x = Math.floor(this.START_X + this.WIDTH * point.x);
            const y = Math.floor(this.START_Y + this.HEIGHT * point.y);
            this.specialPointsLocation[key] = {x, y};
        }
    }

    // given an image, return [numRows x numCols] array of RGB values
    public evaluate(image: PixelReader): BinaryGrid {
        
        let blocks: BlockType[][] = [];

        for (let yIndex = 0; yIndex < this.numRows; yIndex++) {
            let row: BlockType[] = [];

            for (let xIndex = 0; xIndex < this.numCols; xIndex++) {
                const {x, y} = this.positions[yIndex][xIndex]; // ERROR
                const [r, g, b] = image.getPixelAt(x, y)!;
                const hsv = rgbToHsv(r,g,b);
                const isMino = hsv.v >= this.settings.threshold;
                row.push(isMino ? BlockType.FILLED : BlockType.EMPTY);
            }
            blocks.push(row);
        }

        this.specialPointsColor = {};
        for (const [key, point] of Object.entries(this.specialPointsLocation)) {
            const [r, g, b] = image.getPixelAt(point.x, point.y)!;
            this.specialPointsColor[key] = rgbToHsv(r,g,b);
        }

        this.grid = new BinaryGrid(blocks);
        return this.grid;
    }

    // returns the canvas positions of all the OCR points
    public getPositions(): Point[][] {
        return this.positions;
    }

    public getBoundingRect(): Rectangle {
        return this.boundingRect;
    }

    public getGrid(): BinaryGrid | undefined {
        return this.grid;
    }

    public getSpecialPointColor(key: string): HSVColor {
        return this.specialPointsColor[key];
    }

    public getSpecialPointLocation(key: string): Point {
        return this.specialPointsLocation[key];
    }

    public hasEvaluation(): boolean {
        return this.grid !== undefined;
    }

}

export class BoardOCRBox extends OCRBox {

    private static readonly PAUSE_POINTS: SpecialPointsLocation = {
        "PAUSE_U" : {x: 0.5, y: 0.29},
        "PAUSE_S" : {x: 0.6, y: 0.29},
        "PAUSE_E" : {x: 0.72, y: 0.29},
    };

    constructor(settings: CaptureSettings, boundingRect: Rectangle) {

        // main board is 20 rows, 10 columns
        // TUNE THESE VALUES
        super(settings, boundingRect,
            20, 0.03, 0.032, // numRows, paddingTop, paddingBottom
            10, 0.05, 0.035, // numCols, paddingLeft, paddingRight
            BoardOCRBox.PAUSE_POINTS
        );
    }

    public isPaused(): boolean | undefined {
        if (!this.hasEvaluation) return undefined;

        const PAUSE_THRESHOLD_VALUE = 0.3; // if HSV value is greater than this, then pause detected
        const NUM_PAUSE_POINTS_NEEDED = 2;

        // if at least two points detect pause, then pause detected
        let numPausePoints = 0;
        for (let key of ["PAUSE_U", "PAUSE_S", "PAUSE_E"]) {
            const color = this.getSpecialPointColor(key);
            if (color.v >= PAUSE_THRESHOLD_VALUE) {
                numPausePoints++;
            }
        }
        return numPausePoints >= NUM_PAUSE_POINTS_NEEDED;
    }

}