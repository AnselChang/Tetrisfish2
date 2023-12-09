/*
A simulation state is a full board state after a placement.
no information stored about the placement itself, just the board state
A SimulationPlacement takes in a SimulationState, makes a placement, and returns a new SimulationState
*/

import BinaryGrid from "../../models/tetronimo-models/binary-grid";
import { SmartGameStatus } from "../../models/tetronimo-models/smart-game-status";
import { TetrominoType } from "../../models/tetronimo-models/tetromino";

export class SimulationState {

    constructor(
        public readonly board: BinaryGrid,
        public readonly currentPieceType: TetrominoType,
        public readonly nextPieceType: TetrominoType,
        public readonly status: SmartGameStatus
    ) {}

}