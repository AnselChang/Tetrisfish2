/*
Deserializes SR engine-movelist NB request and stores as a model
The top 5 SR moves with 0 reaction time and both current/next piece
*/

import { fetchMovelist } from "../../scripts/evaluation/evaluator";
import { GamePlacement } from "../game-models/game-placement";

export default class EngineMovelistNB {

    static async fetch(placement: GamePlacement, inputFrameTimeline: string): Promise<EngineMovelistNB> {
        const response = await fetchMovelist(placement, inputFrameTimeline, true);
        return new EngineMovelistNB(response);
    }

    constructor(dict: any) {
        console.log("engine movelist nb created", dict);
    }
}