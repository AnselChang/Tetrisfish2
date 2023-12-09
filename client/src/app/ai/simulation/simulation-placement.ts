// Given an AI model, starting board, current piece, and next piece,

import BinaryGrid from "../../models/tetronimo-models/binary-grid";
import { TetrominoType } from "../../models/tetronimo-models/tetromino";
import { BestMoveRequest } from "../abstract-ai-adapter/best-move-request";
import { BestMoveResponse } from "../abstract-ai-adapter/best-move-response";
import { StackRabbitAIAdapter } from "../ai-adapters/stackrabbit-ai-adapter";
import { SimulationState } from "./simulation-state";

// do all the computations to be able to simulate the piece falling and placement of the piece
export class SimulationPlacement {

    private stateAfter?: SimulationState;
    private placement?: BestMoveResponse;

    constructor(
        private readonly ai: StackRabbitAIAdapter,
        private readonly stateBefore: SimulationState,
    ) {

    }

    // compute the placement as well as the resulting state after the placement
    // nextNextPieceType is the next box piece after placement, generated by seed/rng
    // return false if no possible placements (topped out)
    public async compute(nextNextPieceType: TetrominoType): Promise<boolean> {

        // get the best move
        this.placement = await this.ai.getBestMove(new BestMoveRequest(
            this.stateBefore.board,
            this.stateBefore.currentPieceType,
            this.stateBefore.nextPieceType,
        ));

        if (this.placement === undefined) {
            return false;
        }

        // after placement is found, compute the board after placement
        const boardAfter = this.stateBefore.board.copy();
        this.placement.currentPlacement.blitToGrid(boardAfter);

        // Update any line clears. Any line clears will update score/level/lines
        const numLinesCleared = boardAfter.processLineClears();
        const statusAfter = this.stateBefore.status.copy();
        statusAfter.onLineClear(numLinesCleared);

        // set the state after
        this.stateAfter = new SimulationState(
            boardAfter,
            this.stateBefore.nextPieceType,
            nextNextPieceType,
            statusAfter,
        );

        return true;
    }

    public hasComputedPlacement(): boolean {
        return this.placement !== undefined;
    }

    public getPlacement(): BestMoveResponse | undefined {
        return this.placement;
    }

    public getStateAfter(): SimulationState | undefined {
        return this.stateAfter;
    }

    public getStateBefore(): SimulationState {
        return this.stateBefore;
    }

}