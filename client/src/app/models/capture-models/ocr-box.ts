/*
Stores a rectangle dimensions, and the specifications of the matrix within the rectangle
to OCR

For example, the ocr box for the main board should store relative positions of the
minos
*/

import { Bitboard } from "../../scripts/bitboard";
import { HSVColor, rgbToHsv } from "../../scripts/color";
import BinaryGrid, { BlockType } from "../tetronimo-models/binary-grid";
import { CaptureSettings, Rectangle, ThresholdType } from "./capture-settings";
import { PixelReader } from "./pixel-reader";
import { Point } from "./point";

type SpecialPointsLocation = {
    [key: string]: Point
};

type SpecialPointsColor = {
    [key: string]: HSVColor
};

class OCRPosition {
    constructor(
        public numRows: number, // how many OCR dots to read vertically
        public paddingTop: number, // distance (in percent of height) before first OCR dot row
        public paddingBottom: number, // distance (in percent of height) after last OCR dot row
        public numCols: number, // how many OCR dots to read horizontally
        public paddingLeft: number, // distance (in percent of width) before first OCR dot column
        public paddingRight: number, // distance (in percent of width) after last OCR dot column
    ) {}
}

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
        protected thresholdType: ThresholdType,
        public p: OCRPosition,
        specialPoints: SpecialPointsLocation = {} // special points to capture. units in percent of width/height
    ) {

        const boundingWidth = boundingRect.right - boundingRect.left;
        const boundingHeight = boundingRect.bottom - boundingRect.top;

        this.HEIGHT = boundingHeight * (1 - p.paddingTop - p.paddingBottom);
        this.START_Y = boundingRect.top + boundingHeight * p.paddingTop;

        this.WIDTH = boundingWidth * (1 - p.paddingLeft - p.paddingRight);
        this.START_X = boundingRect.left + boundingWidth * p.paddingLeft;

        this.positions = [];
        for (let yIndex = 0; yIndex < p.numRows; yIndex++) {
            let row: Point[] = [];

            const y = Math.floor(this.START_Y + this.HEIGHT * (yIndex / (p.numRows-1)));

            for (let xIndex = 0; xIndex < p.numCols; xIndex++) {
                const x = Math.floor(this.START_X + this.WIDTH * (xIndex / (p.numCols-1)));
                
                row.push({x, y});
            }
            this.positions.push(row);
        } 
        
        // convert special points from percent to pixels
        this.specialPointsLocation = {};
        for (const [key, point] of Object.entries(specialPoints)) {
            this.specialPointsLocation[key] = this.getCanvasPositionFromRelative(point);
        }
    }

    // convert from relative percents of box width/height to absolute pixels on canvas
    public getCanvasPositionFromRelative(relativePosition: Point): Point {
        const x = Math.floor(this.START_X + this.WIDTH * relativePosition.x);
        const y = Math.floor(this.START_Y + this.HEIGHT * relativePosition.y);
        return {x, y};
    }

    // given an image, return [numRows x numCols] array of RGB values
    public evaluate(image: PixelReader): BinaryGrid {
        
        let blocks: BlockType[][] = [];

        for (let yIndex = 0; yIndex < this.p.numRows; yIndex++) {
            let row: BlockType[] = [];

            for (let xIndex = 0; xIndex < this.p.numCols; xIndex++) {
                const {x, y} = this.positions[yIndex][xIndex];
                const [r, g, b] = image.getPixelAt(x, y)!;
                const hsv = rgbToHsv(r,g,b);
                const thresholdValue = this.settings.thresholds[this.thresholdType].value;
                const isMino = hsv.v >= thresholdValue;
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

    public getAllSpecialPointKeys(): string[] {
        return Object.keys(this.specialPointsLocation);
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
        "PAUSE_U" : {x: 0.5, y: 0.288},
        "PAUSE_S" : {x: 0.6, y: 0.288},
        "PAUSE_E" : {x: 0.72, y: 0.288},
    };

    // Locations to floodfill to find the next box relative to the main board
    private static readonly NEXTBOX_LOCATIONS = [
        {x: 1.5, y: 0.41}, // top of the next box
        {x: 1.5, y: 0.595} // bottom of the next box
    ];

    private static readonly LEVEL_LOCATION = {x: 1.35, y: 0.8};
    private static readonly LINES_LOCATION = {x: 0.01, y: -0.15};

    constructor(settings: CaptureSettings, boundingRect: Rectangle) {

        // main board is 20 rows, 10 columns
        // TUNE THESE VALUES
        super(settings, boundingRect, ThresholdType.MINO,
            new OCRPosition(
                20, 0.03, 0.032, // numRows, paddingTop, paddingBottom
                10, 0.05, 0.038, // numCols, paddingLeft, paddingRight
            ),
            BoardOCRBox.PAUSE_POINTS
        );
    }

    public getNextBoxCanvasLocations(): Point[] {
        return BoardOCRBox.NEXTBOX_LOCATIONS.map((point) => this.getCanvasPositionFromRelative(point));
    }

    public getLevelCanvasLocation(): Point {
        return this.getCanvasPositionFromRelative(BoardOCRBox.LEVEL_LOCATION);
    }

    public getLinesCanvasLocation(): Point {
        return this.getCanvasPositionFromRelative(BoardOCRBox.LINES_LOCATION);
    }

    public isPaused(): boolean | undefined {
        if (!this.hasEvaluation) return undefined;

        const PAUSE_THRESHOLD_VALUE = 30; // if HSV value is greater than this, then pause detected
        const NUM_PAUSE_POINTS_NEEDED = 2;

        // if at least two points detect pause, then pause detected
        let numPausePoints = 0;
        let results = [];
        for (let key of ["PAUSE_U", "PAUSE_S", "PAUSE_E"]) {
            const color = this.getSpecialPointColor(key);
            results.push(color.v);
            if (color.v >= PAUSE_THRESHOLD_VALUE) {
                numPausePoints++;
            }
        }
        //console.log("results", results);
        return numPausePoints >= NUM_PAUSE_POINTS_NEEDED;
    }

}

export class NextOCRBox extends OCRBox {
    
        constructor(settings: CaptureSettings, boundingRect: Rectangle) {
    
            // next box is 6 rows, 8 columns
            // TUNE THESE VALUES
            super(settings, boundingRect, ThresholdType.MINO,
                new OCRPosition(
                    6, 0.37, 0.18, // numRows, paddingTop, paddingBottom
                    8, 0.08, 0.06, // numCols, paddingLeft, paddingRight
                )
            );
        }
}

export class NumberOCRBox extends OCRBox {

    private static readonly RESOLUTION = 16;
    
    constructor(settings: CaptureSettings, boundingRect: Rectangle, private numDigits: number,
        public paddingTop: number, // distance (in percent of height) before first OCR dot row
        public paddingBottom: number, // distance (in percent of height) after last OCR dot row
        public paddingLeft: number, // distance (in percent of width) before first OCR dot column
        public paddingRight: number,
    ) {

        const NUM_ROWS = NumberOCRBox.RESOLUTION;
        const NUM_COLS = NumberOCRBox.RESOLUTION * numDigits;

        // level box is 1 row, 2 columns
        // TUNE THESE VALUES
        super(settings, boundingRect, ThresholdType.TEXT,
            new OCRPosition(
                NUM_ROWS, paddingTop, paddingBottom,
                NUM_COLS, paddingLeft, paddingRight
            )
        );
    }

    // if digit is 0, then columns 0-15 are used, etc.
    convertToBitboard(digit: number): Bitboard | undefined {

        if (!this.hasEvaluation()) {
            return undefined;
        }

        let bigIntValue = 0n;

        const startX = digit * NumberOCRBox.RESOLUTION;
        const endX = startX + NumberOCRBox.RESOLUTION;
      
        // Assuming grid is a 16x16 array
        for (let y = 0; y < 16; y++) {
          for (let x = startX; x < endX; x++) {
            // Calculate the bit position
            const bitPosition = BigInt(y * 16 + x);
            // Set the bit if the cell in the grid is 1
            if ((this.getGrid()!).at(x,y) === BlockType.FILLED) {
              bigIntValue |= (1n << bitPosition);
            }
          }
        }
      
        return new Bitboard(bigIntValue);
    }

    getDigits(): Bitboard[] | undefined {
            
        if (!this.hasEvaluation()) {
            return undefined;
        }

        let digits: Bitboard[] = [];
        for (let digit = 0; digit < this.numDigits; digit++) {
            digits.push(this.convertToBitboard(digit)!);
        }
        return digits;
    }
}

export class LevelOCRBox extends NumberOCRBox {
    
    constructor(settings: CaptureSettings, boundingRect: Rectangle) {

        super(settings, boundingRect, 2,
            0.5, 0.18, // paddingTop, paddingBottom
            0.42, 0.25, // paddingLeft, paddingRight
        );
    }
}

export class LinesOCRBox extends NumberOCRBox {

    constructor(settings: CaptureSettings, boundingRect: Rectangle) {

        super(settings, boundingRect, 3,
            0.21, 0.3, // paddingTop, paddingBottom
            0.69, 0.04, // paddingLeft, paddingRight
        );
    }

}