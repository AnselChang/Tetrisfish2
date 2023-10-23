/*
Stores state for the interactable current piece on the board.
Stores whether the piece exists, and if so, whether it's being placed/hovered, the piece type, rotation, and position.
This object is mutable and is injected into the interactive tetris board component. 
*/

import MoveableTetromino from "../../../models/mutable-tetris-models/moveable-tetromino";

export enum CurrentPieceState {
    NONE, // no current piece displayed
    FIXED, // current piece is placed on the board
    TEMPORARY // current piece being moved around by the mouuse on the board
}

export default class CurrentPiece {

    constructor(
        public state: CurrentPieceState,
        public tetromino: MoveableTetromino | null = null
    ) {}

}