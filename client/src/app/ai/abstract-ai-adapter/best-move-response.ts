import MoveableTetromino from "../../models/game-models/moveable-tetromino";

/*
The standardized response format to get the best move for some AI. AI implementations provide
adapters to convert from their own response format to this one.
*/
export class BestMoveResponse {
    constructor(
        public readonly currentPlacement: MoveableTetromino,
        public readonly nextPlacement?: MoveableTetromino,
        public readonly evaluation?: number,
        public readonly inputSequence?: string,
    ) {}
}