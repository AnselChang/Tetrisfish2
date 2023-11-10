/*
Deserializes SR rate-move deep/shallow request and stores as a model
A numerical rating of a move considering both the current and next piece
rate-move returns a dictionary of the form:
{
    playerMoveNoAdjustment: number (player move's eval not considering next box),
    playerMoveAfterAdjustment: number (player move's eval considering next box),
    bestMoveNoAdjustment: number (best move's eval not considering next box),
    bestMoveAfterAdjustment: number (best move's eval considering next box),
}
*/

import { fetchRateMove } from "../../scripts/evaluation/evaluator";
import { LookaheadDepth } from "../../scripts/evaluation/stack-rabbit-api";
import { GamePlacement } from "../game-models/game-placement";

abstract class RateMove {
    constructor(dict: any) {
        console.log("rate move created", dict);
    }
}

export class RateMoveDeep extends RateMove {

    static async fetch(placement: GamePlacement, inputFrameTimeline: string): Promise<RateMoveDeep> {
        const response = await fetchRateMove(placement, inputFrameTimeline, LookaheadDepth.DEEP);
        return new RateMoveDeep(response);
    }
}
export class RateMoveShallow extends RateMove {

    static async fetch(placement: GamePlacement, inputFrameTimeline: string): Promise<RateMoveShallow> {
        const response = await fetchRateMove(placement, inputFrameTimeline, LookaheadDepth.SHALLOW);
        return new RateMoveShallow(response);
    }
    
}