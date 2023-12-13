// return a list of rows that are forced to be burned
// essentially counts the number of rows that puts weight on a hole

import BinaryGrid, { BlockType } from "../models/tetronimo-models/binary-grid";

// for all columns 
export function findForcedBurnLines(board: BinaryGrid, excludeRightColumn: boolean = false): number[] {

    const burnRows: number[] = [];

    const addIfNotIn = (row: number) => {
        if (!burnRows.includes(row)) burnRows.push(row);
    }

    const maxCol = excludeRightColumn ? 9 : 10;

    // For each column, add rows with weight above hold if not already in list
    // start from the bottom, while block loop until empty, and after empty count all filled as burn lines
    for (let col = 0; col < 10; col++) {
        let row = 19;
        while (row >= 0) {
            if (board.at(col, row) === BlockType.FILLED) {
                row--;
            } else {
                row--;
                break;
            }
        }

        while (row >= 0) {
            if (board.at(col, row) === BlockType.FILLED) {
                addIfNotIn(row); 
            }
            row--;
        }
    }

    return burnRows;

}