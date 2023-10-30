/*
Stores a rectangle dimensions, and the specifications of the matrix within the rectangle
to OCR

For example, the ocr box for the main board should store relative positions of the
minos
*/

import { HSVColor, rgb2hsv } from "../../scripts/color";
import { Rectangle } from "./capture-settings";
import { PixelReader } from "./pixel-reader";
import { Point } from "./point";

// the result of the OCRBox evaluation
// matrix[y][x]
export class OCRMatrix {
    constructor(private matrix: HSVColor[][]) {} // a 2D matrix of colors

}


export class OCRBox {

    // all the canvas positions of the OCR matrixs
    // each position is (x,y)
    // pos[y][x]
    private positions: Point[][];

    constructor(
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
    public evaluate(image: PixelReader): OCRMatrix {
        
        let matrix: HSVColor[][] = [];

        for (let yIndex = 0; yIndex <= this.numRows; yIndex++) {
            let row: HSVColor[] = [];

            for (let xIndex = 0; xIndex <= this.numCols; xIndex++) {
                const {x, y} = this.positions[yIndex][xIndex];
                const [r, g, b] = image.getPixelAt(x, y)!;
                const hsv = rgb2hsv(r,g,b);
                row.push(hsv);
            }
            matrix.push(row);
        }

        return new OCRMatrix(matrix);
    }

    // returns the canvas positions of all the OCR points
    public getPositions(): Point[][] {
        return this.positions;
    }

    public getBoundingRect(): Rectangle {
        return this.boundingRect;
    }

}

export class BoardOCRBox extends OCRBox {

    constructor(boundingRect: Rectangle) {

        // main board is 20 rows, 10 columns
        // TUNE THESE VALUES
        super(boundingRect,
            20, 0.03, 0.035, // numRows, paddingTop, paddingBottom
            10, 0.05, 0.04 // numCols, paddingLeft, paddingRight
        );
    }

}