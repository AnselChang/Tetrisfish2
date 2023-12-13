import BinaryGrid, { BlockType } from "../models/tetronimo-models/binary-grid";

// From binary grid, get surface array of height of the 10 columns
export function getSurfaceArray(board: BinaryGrid): number[] {

    // calculate surface array by finding the height of each column
    const surface: number[] = [];
    for (let x = 0; x < 10; x++) {
        let y = 0;
        while (y < 20 && board.at(x, y) === BlockType.EMPTY) {
            y++;
        }
        surface.push(20 - y);
    }

    return surface;
}