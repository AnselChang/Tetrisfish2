/*
Stores a rectangle dimensions, and the specifications of the matrix within the rectangle
to OCR

For example, the ocr box for the main board should store relative positions of the
minos
*/

import { Rectangle } from "./capture-settings";
import { PixelReader } from "./pixel-reader";

// the result of the OCRBox evaluation
// matrix[y][x]
export class OCRMatrix {
    constructor(private matrix: number[][][]) {} // a 2D matrix of colors

}

export class OCRBox {

    constructor(
        public boundingRect: Rectangle,
        public numRows: number, // how many OCR dots to read vertically
        public paddingTop: number, // distance (in percent of height) before first OCR dot row
        public paddingBottom: number, // distance (in percent of height) after last OCR dot row
        public numCols: number, // how many OCR dots to read horizontally
        public paddingLeft: number, // distance (in percent of width) before first OCR dot column
        public paddingRight: number // distance (in percent of width) after last OCR dot column
    ) {}

    // given an image, return [numRows x numCols] array of RGB values
    public evaluate(image: PixelReader): OCRMatrix {
        
        let matrix: number[][][] = [];

        let height = image.getHeight() * (1 - this.paddingTop - this.paddingBottom);
        let startY = image.getHeight() * this.paddingTop;

        let width = image.getWidth() * (1 - this.paddingLeft - this.paddingRight);
        let startX = image.getWidth() * this.paddingLeft;

        for (let yIndex = 0; yIndex <= this.numRows; yIndex++) {
            let row: number[][] = [];

            const y = startY + height * (yIndex / this.numRows);

            for (let xIndex = 0; xIndex <= this.numCols; xIndex++) {
                const x = startX + width * (xIndex / this.numCols);
                const color = image.getPixelAt(x, y)!;
                row.push(color);
            }
            matrix.push(row);
        }

        return new OCRMatrix(matrix);
    }

}

export class BoardOCRBox extends OCRBox {

    constructor(boundingRect: Rectangle) {

        // main board is 20 rows, 10 columns
        super(boundingRect,
            20, 0.025, 0.025,
            10, 0.05, 0.05
        );
    }

}