import MoveableTetromino from "../models/game-models/moveable-tetromino";
import BinaryGrid from "../models/tetronimo-models/binary-grid";
import { Tetromino, TetrominoType } from "../models/tetronimo-models/tetromino";

// FAKE move generation by just dropping pieces of all rotations on all columns of the board
// returns a list of valid placements
export function fakeMoveGeneration(board: BinaryGrid, type: TetrominoType): MoveableTetromino[] {

    const validPlacements: MoveableTetromino[] = [];

    // loop through all rotations
    const maxRotations = Tetromino.getPieceByType(type).numPossibleRotations();
    for (let rotation = 0; rotation < maxRotations; rotation++) {

        // loop through all columns in which the piece is fully on the board
        let column = 0;
        while ((new MoveableTetromino(type, rotation, column, 0).isInBounds())) {

            // drop the piece until it is a valid placement
            let row = 0;
            while (true) {
                const mt = new MoveableTetromino(type, rotation, column, row);

                // not in bounds. break
                if (!mt.isInBounds()) break;

                // valid placement. add to list then break
                if (mt.isValidPlacement(board)) {
                    validPlacements.push(mt);
                    break;
                }  

                // not valid placement. keep dropping
                row++;
            }
        }
    }
    
    // debug: print all
    for (const placement of validPlacements) {
        console.log(placement.print());
    }

    return validPlacements;

}