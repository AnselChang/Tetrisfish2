/*
Stores a rectangle dimensions, and the specifications of the matrix within the rectangle
to OCR

For example, the ocr box for the main board should store relative positions of the
minos
*/

import { Rectangle } from "./capture-settings";
import { PixelReader } from "./pixel-reader";

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
    public evaluate(image: PixelReader): number[][][] {
        return [];
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