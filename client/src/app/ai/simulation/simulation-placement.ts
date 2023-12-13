// Given an AI model, starting board, current piece, and next piece,
import { BasePlacement } from "../../models/game-models/base-placement";
import MoveableTetromino from "../../models/game-models/moveable-tetromino";
import BinaryGrid from "../../models/tetronimo-models/binary-grid";
import { TetrominoType } from "../../models/tetronimo-models/tetromino";
import { InputSpeed } from "../../scripts/evaluation/input-frame-timeline";
import { AbstractAIAdapter } from "../abstract-ai-adapter/abstract-ai-adapter";
import { BestMoveRequest } from "../abstract-ai-adapter/best-move-request";
import { BestMoveResponse } from "../abstract-ai-adapter/best-move-response";
import { StackRabbitAIAdapter, StackRabbitVariant } from "../ai-adapters/stackrabbit-ai-adapter";
import { SimulationState } from "./simulation-state";

// do all the computations to be able to simulate the piece falling and placement of the piece
export class SimulationPlacement implements BasePlacement {

    private stateAfter?: SimulationState;
    private placement?: BestMoveResponse;
    private numLinesCleared?: number;

    constructor(
        private readonly ai: AbstractAIAdapter,
        private readonly stateBefore: SimulationState,
    ) {

    }

    // compute the placement as well as the resulting state after the placement
    // nextNextPieceType is the next box piece after placement, generated by seed/rng
    // return false if no possible placements (topped out)
    public async compute(variant: string, nextNextPieceType: TetrominoType, inputSpeed: InputSpeed, reactionTimeFrames: number): Promise<boolean> {

        // get the best move
        this.placement = await this.ai.getBestMove(variant, new BestMoveRequest(
            this.stateBefore.board,
            this.stateBefore.currentPieceType,
            this.stateBefore.nextPieceType,
            this.stateBefore.status.level,
            this.stateBefore.status.lines,
            this.stateBefore.status.score,
            inputSpeed,
            reactionTimeFrames
        ));

        if (this.placement === undefined) {
            return false;
        }

        // after placement is found, compute the board after placement
        const boardAfter = this.stateBefore.board.copy();
        this.placement.currentPlacement.blitToGrid(boardAfter);

        // Update any line clears. Any line clears will update score/level/lines
        this.numLinesCleared = boardAfter.processLineClears();
        const statusAfter = this.stateBefore.status.copy();
        statusAfter.onLineClear(this.numLinesCleared);

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

    public getNumLinesCleared(): number | undefined {
        return this.numLinesCleared;
    }

    public getStateAfter(): SimulationState | undefined {
        return this.stateAfter;
    }

    public getStateBefore(): SimulationState {
        return this.stateBefore;
    }

    public getBoard(): BinaryGrid {
        return this.stateBefore.board;
    }

    public getMTPlacement(): MoveableTetromino {
        if (!this.placement) throw new Error("No placement");
        return this.placement.currentPlacement;
    }

    public getNextType(): TetrominoType {
        return this.stateBefore.nextPieceType;
    }

}