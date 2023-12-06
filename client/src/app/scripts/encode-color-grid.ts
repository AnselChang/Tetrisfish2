import BinaryGrid, { BlockType } from "../models/tetronimo-models/binary-grid";
import ColorGrid from "../models/tetronimo-models/color-grid";
import { TetrominoColorType } from "../models/tetronimo-models/tetromino";


export function areUint8ArraysEqual(a?: Uint8Array, b?: Uint8Array): boolean {

    if (!a && !b) {
        return true;
    }

    if (!a || !b) {
        return false;
    }

    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

export function encodeColorGrid(binaryGrid: BinaryGrid, colorGrid: ColorGrid): Uint8Array {
    const numRows = 20;
    const numCols = 10;
    const bufferSize = Math.ceil((numRows * numCols * 2) / 8); // 2 bits per cell
    const buffer = new Uint8Array(bufferSize);

    let bufferIndex = 0;
    let bitIndex = 0;

    for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numCols; x++) {
            let combinedValue = 0;
            if (binaryGrid.at(x, y) === BlockType.EMPTY) {
                combinedValue = 0;
            } else {
                switch (colorGrid.at(x, y)) {
                    case TetrominoColorType.COLOR_WHITE:
                        combinedValue = 1;
                        break;
                    case TetrominoColorType.COLOR_FIRST:
                        combinedValue = 2;
                        break;
                    case TetrominoColorType.COLOR_SECOND:
                        combinedValue = 3;
                        break;
                    default:
                        throw new Error("Invalid color");
                }
            }

            buffer[bufferIndex] |= combinedValue << (6 - bitIndex);

            bitIndex += 2;
            if (bitIndex === 8) {
                bufferIndex++;
                bitIndex = 0;
            }
        }
    }

    return buffer;
}

export function decodeColorGrid(buffer?: Uint8Array): { binaryGrid: BinaryGrid, colorGrid: ColorGrid } {

    if (!buffer) {
        return {
            binaryGrid: new BinaryGrid(),
            colorGrid: new ColorGrid(),
        };
    }

    const numRows = 20;
    const numCols = 10;
    const binaryGrid = new BinaryGrid([], numRows, numCols);
    const colorGrid = new ColorGrid([], numRows, numCols);

    let bufferIndex = 0;
    let bitIndex = 0;

    for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numCols; x++) {
            const combinedValue = (buffer[bufferIndex] >> (6 - bitIndex)) & 0x03;

            if (combinedValue === 0) {
                binaryGrid.setAt(x, y, BlockType.EMPTY);
                colorGrid.setAt(x, y, TetrominoColorType.COLOR_WHITE); // Default color for empty cells
            } else {
                binaryGrid.setAt(x, y, BlockType.FILLED);
                if (combinedValue === 1) {
                    colorGrid.setAt(x, y, TetrominoColorType.COLOR_WHITE);
                } else if (combinedValue === 2) {
                    colorGrid.setAt(x, y, TetrominoColorType.COLOR_FIRST);
                } else {
                    colorGrid.setAt(x, y, TetrominoColorType.COLOR_SECOND);
                }
            }

            bitIndex += 2;
            if (bitIndex === 8) {
                bufferIndex++;
                bitIndex = 0;
            }
        }
    }

    return { binaryGrid, colorGrid };
}
