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


export class OCRBox {

    // all the canvas positions of the OCR matrixs
    // each position is (x,y)
    // pos[y][x]
    private positions: Point[][];
    private grid?: BinaryGrid;

    constructor(
        private settings: CaptureSettings,
        public boundingRect: Rectangle,
        public numRows: number, // how many OCR dots to read vertically
        public paddingTop: number, // distance (in percent of height) before first OCR dot row
        public paddingBottom: number, // distance (in percent of height) after last OCR dot row
        public numCols: number, // how many OCR dots to read horizontally
        public paddingLeft: number, // distance (in percent of width) before first OCR dot column
        public paddingRight: number // distance (in percent of width) after last OCR dot column
    ) {

        const boundingWidth = boundingRect.right - boundingRect.left;
        const boundingHeight = boundingRect.bottom - boundingRect.top;

        let height = boundingHeight * (1 - this.paddingTop - this.paddingBottom);
        let startY = boundingRect.top + boundingHeight * this.paddingTop;

        let width = boundingWidth * (1 - this.paddingLeft - this.paddingRight);
        let startX = boundingRect.left + boundingWidth * this.paddingLeft;

        this.positions = [];
        for (let yIndex = 0; yIndex < this.numRows; yIndex++) {
            let row: Point[] = [];

            const y = Math.floor(startY + height * (yIndex / (this.numRows-1)));

            for (let xIndex = 0; xIndex < this.numCols; xIndex++) {
                const x = Math.floor(startX + width * (xIndex / (this.numCols-1)));
                
                row.push({x, y});
            }
            this.positions.push(row);
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

}

export class BoardOCRBox extends OCRBox {

    constructor(settings: CaptureSettings, boundingRect: Rectangle) {

        // main board is 20 rows, 10 columns
        // TUNE THESE VALUES
        super(settings, boundingRect,
            20, 0.03, 0.032, // numRows, paddingTop, paddingBottom
            10, 0.05, 0.035 // numCols, paddingLeft, paddingRight
        );
    }

}