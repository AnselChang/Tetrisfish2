/*
The model for a full game, consisting of a list of placements optionally with evaluations
*/

import { fetchMovelist } from "../../scripts/evaluation/evaluator";
import { HZ_30 } from "../../scripts/evaluation/input-frame-timeline";
import EngineMovelistNB from "../analysis-models/engine-movelist-nb";
import EngineMovelistNNB from "../analysis-models/engine-movelist-nnb";
import { RateMoveDeep, RateMoveShallow } from "../analysis-models/rate-move";
import BinaryGrid from "../tetronimo-models/binary-grid";
import { SmartGameStatus } from "../tetronimo-models/smart-game-status";
import { TetrominoType } from "../tetronimo-models/tetromino";
import { GamePlacement } from "./game-placement";
import MoveableTetromino from "./moveable-tetromino";

export class Game {

    private placements: GamePlacement[] = [];
    

    constructor(public readonly startLevel: number) {
    }

    // get the last position, which does not necessarily have a placement
    public getLastPosition(): GamePlacement | undefined {
        return this.placements[this.placements.length - 1];
    }

    // get the last position that has a placement
    public getLastPlacement(): GamePlacement | undefined {
        
        const lastPosition = this.getLastPosition();
        if (!lastPosition) return undefined;
        if (lastPosition.hasPlacement()) return lastPosition;
        if (this.placements.length < 2) return undefined;

        const secondLastPosition = this.placements[this.placements.length - 2];
        if (!secondLastPosition.hasPlacement()) throw new Error("Inconsistent state: last two positions both don't have placement");
        return secondLastPosition;
    }

    public addNewPosition(grid: BinaryGrid, currentPieceType: TetrominoType, nextPieceType: TetrominoType, statusBeforePlacement: SmartGameStatus): GamePlacement {
        if (this.getLastPosition() && !this.getLastPosition()!.hasPlacement()) {
            throw new Error("Cannot add new position to game where the last state also had no placement");
        }

        const newPlacement = new GamePlacement(grid, currentPieceType, nextPieceType, statusBeforePlacement.copy());
        this.placements.push(newPlacement);

        // non-blocking fetch SR engine-movelist NB, set to placement analysis when it's done fetching 
        EngineMovelistNB.fetch(newPlacement, HZ_30).then(engineMovelistNB => {
            newPlacement.analysis.setEngineMoveListNB(engineMovelistNB);
        });

        // // non-blocking fetch SR engine-movelist NNB, set to placement analysis when it's done fetching
        // EngineMovelistNNB.fetch(newPlacement, HZ_30).then(engineMovelistNNB => {
        //     newPlacement.analysis.setEngineMoveListNNB(engineMovelistNNB);
        // });

        return newPlacement;
    }

    public setPlacementForLastPosition(moveableTetronimo: MoveableTetromino, numLineClears: number) {
        
        if (!this.getLastPosition()) throw new Error("Game has no positions to set placement for");
        if (this.getLastPosition()!.hasPlacement()) throw new Error("Last placement already has a placement");

        const placement = this.getLastPosition()!;
        placement.setPlacement(moveableTetronimo, numLineClears);

        // non-blocking fetch the engine rate-move deep, set to placement analysis when it's done fetching
        RateMoveDeep.fetch(placement, HZ_30).then(rateMoveDeep => {
            placement.analysis.setRateMoveDeep(rateMoveDeep);
        });

        // non-blocking fetch the engine rate-move shallow, set to placement analysis when it's done fetching
        // RateMoveShallow.fetch(placement, HZ_30).then(rateMoveShallow => {
        //     placement.analysis.setRateMoveShallow(rateMoveShallow);
        // });
    }

}