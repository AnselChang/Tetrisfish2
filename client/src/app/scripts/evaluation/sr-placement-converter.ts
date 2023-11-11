import MoveableTetromino from "../../models/game-models/moveable-tetromino";
import { TetrominoType } from "../../models/tetronimo-models/tetromino";

type SRPlacement = [number, number, number];

/*
Takes in a [rot, x, y] SR placement and converts to a MoveableTetromino
*/

export function convertSRPlacement(placement: SRPlacement, pieceType: TetrominoType): MoveableTetromino {
    let [rot, x, y] = placement;

    x += 3;
    y -= 1;

    if (pieceType === TetrominoType.I_TYPE) {
        if (rot == 0) y += 1;
        else if (rot == 1) x += 2; y -= 1;
    } else if (pieceType === TetrominoType.L_TYPE) {
        if (rot == 0) { x += 1; y += 1}
        if (rot == 1) x += 1;
        if (rot == 2) {x += 1;}
        if (rot == 3) {x += 2;}
    } else if (pieceType === TetrominoType.Z_TYPE) {
        if (rot == 0) { x += 1; y += 1;}
        if (rot == 1) {x += 2;}
    } else if (pieceType === TetrominoType.S_TYPE) {
        if (rot == 0) { x += 1; y += 1;}
        if (rot == 1) { x += 2;}
    } else if (pieceType === TetrominoType.J_TYPE) {
        if (rot == 0) { x += 1; y += 1}
        if (rot == 1) x += 1;
        if (rot == 2) {x += 1;}
        if (rot == 3) {x += 2;}
    } else if (pieceType === TetrominoType.T_TYPE) {
        if (rot == 0) { x += 1; y += 1}
        if (rot == 1) x += 1;
        if (rot == 2) {x += 1;}
        if (rot == 3) {x += 2;}
    } else if (pieceType === TetrominoType.O_TYPE) {
        x += 1; y += 1;
    }

    return new MoveableTetromino(pieceType, rot, x, y);
}