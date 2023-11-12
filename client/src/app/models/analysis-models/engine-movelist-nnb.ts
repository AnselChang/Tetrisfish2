/*
Deserializes SR engine-movelist NNB request and stores as a model
The best default move, as well as the best SR move for each of the 7 possible next boxes
*/

import { fetchMovelist } from "../../scripts/evaluation/evaluator";
import { InputSpeed } from "../../scripts/evaluation/input-frame-timeline";
import { GamePlacement } from "../game-models/game-placement";

export default class EngineMovelistNNB {

    static async fetch(placement: GamePlacement, inputSpeed: InputSpeed): Promise<EngineMovelistNNB> {
        const response = await fetchMovelist(placement, inputSpeed, false);
        return new EngineMovelistNNB(response);
    }

    constructor(dict: any) {
        // console.log("engine movelist nnb created", dict);
    }
}