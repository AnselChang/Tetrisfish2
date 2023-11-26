import MoveableTetromino from "./game-models/moveable-tetromino";
import BinaryGrid from "./tetronimo-models/binary-grid";

export class Puzzle {

    constructor(
        public readonly grid: BinaryGrid,
        public readonly firstPieceSolution: MoveableTetromino,
        public readonly secondPieceSolution: MoveableTetromino,
        public readonly difficulty: number,
    ) {}
}