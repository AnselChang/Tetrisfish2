import MoveableTetromino from "../mutable-tetris-models/moveable-tetromino";

// A representation of one of SR's top 5 moves for a given position
export class MoveRecommendation {
    constructor(
        public rank: number, // 0-index, lower the better
        public currentPiecePlacement: MoveableTetromino,
        public nextPiecePlacement: MoveableTetromino,
        public evaluation: number
    ) {}
}