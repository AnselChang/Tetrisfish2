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

                // intersects grid. break
                if (mt.intersectsGrid(board)) break;

                // valid placement. add to list then break
                if (mt.isValidPlacement(board)) {
                    validPlacements.push(mt);
                    break;
                }  

                // not valid placement. keep dropping
                row++;
            }

            column++;
        }
    }    

    return validPlacements;

}

// return [{piece: MoveableTetromino, board: BinaryGrid}] pairs for all possible placements of the current and next piece
// MoveableTetromino is the placement of the first piece
// BinaryGrid is the board state after the placement of BOTH the first and second pieces
export function depthTwoFakeMoveGeneration(
    board: BinaryGrid,
    currentPieceType: TetrominoType,
    nextPieceType: TetrominoType
): {
    firstPiecePlacement: MoveableTetromino,
    secondPiecePlacement: MoveableTetromino,
    board: BinaryGrid
}[] {

    const startTime = Date.now();

    const result: {firstPiecePlacement: MoveableTetromino, secondPiecePlacement: MoveableTetromino, board: BinaryGrid}[] = [];

    // loop through each possible placement of the first piece
    const firstPiecePlacements = fakeMoveGeneration(board, currentPieceType);
    for (const firstPiecePlacement of firstPiecePlacements) {

        // place the first piece on a copy of the board and process line clears
        const boardAfterFirstPiece = board.copy();
        firstPiecePlacement.blitToGrid(boardAfterFirstPiece);
        boardAfterFirstPiece.processLineClears();

        // generate and loop through each possible placement of the second piece for the board after the first piece
        const secondPiecePlacements = fakeMoveGeneration(boardAfterFirstPiece, nextPieceType);
        for (const secondPiecePlacement of secondPiecePlacements) {

            // place the second piece on a copy of the board after the first piece
            const boardAfterSecondPiece = boardAfterFirstPiece.copy();
            secondPiecePlacement.blitToGrid(boardAfterSecondPiece);
            boardAfterSecondPiece.processLineClears();

            // add the result to the list
            result.push({
                firstPiecePlacement: firstPiecePlacement,
                secondPiecePlacement: secondPiecePlacement,
                board: boardAfterSecondPiece
            });
        }
    }

    const endTime = Date.now();
    console.log("Finished depth 2 fake move generation with " + result.length + " placements");
    console.log("Time taken: " + (endTime - startTime) + "ms");

    return result;
    
}