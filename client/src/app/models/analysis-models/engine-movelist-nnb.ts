/*
Deserializes SR engine-movelist NNB request and stores as a model
The best default move, as well as the best SR move for each of the 7 possible next boxes
*/

import { fetchMovelist } from "../../scripts/evaluation/evaluator";
import { GamePlacement } from "../game-models/game-placement";

export default class EngineMovelistNNB {

    static async fetch(placement: GamePlacement, inputFrameTimeline: string): Promise<EngineMovelistNNB> {
        const response = await fetchMovelist(placement, inputFrameTimeline, false);
        return new EngineMovelistNNB(response);
    }

    constructor(dict: any) {
        // console.log("engine movelist nnb created", dict);
    }
}