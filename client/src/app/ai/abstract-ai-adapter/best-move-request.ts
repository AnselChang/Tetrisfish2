import BinaryGrid from "../../models/tetronimo-models/binary-grid";
import { TetrominoType } from "../../models/tetronimo-models/tetromino";
import { InputSpeed } from "../../scripts/evaluation/input-frame-timeline";

/*
The standardized request format to get the best move for some AI.
AI models will provide adapters to convert this to their own format.
*/

export class BestMoveRequest {
    constructor(
        public readonly board: BinaryGrid,
        public readonly currentPieceType: TetrominoType,
        public readonly nextPieceType: TetrominoType,
        public readonly level?: number,
        public readonly lines?: number,
        public readonly score?: number,
        public readonly inputSpeed: InputSpeed = InputSpeed.HZ_30,
        public readonly reactionTime: number = 0,
    ) {}
}