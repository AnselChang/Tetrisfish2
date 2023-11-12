/*
Owned by a GamePlacement. A struct for all the SR analysis for the placement, including:
    - engine-movelist NB
    - engine-movelist NNB
    - rate-move deep
    - rate-move shallow
These are all optional, as we support lazy-loading of analysis data. Only the loaded data will
be shown.
*/

import { EngineMovelistNB, EngineMovelistNNB } from "../analysis-models/engine-movelist";
import { RateMoveDeep, RateMoveShallow } from "../analysis-models/rate-move";

export default class PlacementAnalysis {
    private engineMovelistNB?: EngineMovelistNB;
    private engineMovelistNNB?: EngineMovelistNNB;
    private rateMoveDeep?: RateMoveDeep;
    private rateMoveShallow?: RateMoveShallow;

    hasEngineMovelistNB(): boolean { return this.engineMovelistNB !== undefined; }
    hasEngineMovelistNNB(): boolean { return this.engineMovelistNNB !== undefined; }
    hasRateMoveDeep(): boolean { return this.rateMoveDeep !== undefined; }
    hasRateMoveShallow(): boolean { return this.rateMoveShallow !== undefined; }

    setEngineMoveListNB(engineMovelistNB: EngineMovelistNB) { this.engineMovelistNB = engineMovelistNB; }
    setEngineMoveListNNB(engineMovelistNNB: EngineMovelistNNB) { this.engineMovelistNNB = engineMovelistNNB; }
    setRateMoveDeep(rateMoveDeep: RateMoveDeep) { this.rateMoveDeep = rateMoveDeep; }
    setRateMoveShallow(rateMoveShallow: RateMoveShallow) { this.rateMoveShallow = rateMoveShallow; }


    getEngineMoveListNB(): EngineMovelistNB | undefined { return this.engineMovelistNB; }
    getEngineMoveListNNB(): EngineMovelistNNB | undefined { return this.engineMovelistNNB; }
    getRateMoveDeep(): RateMoveDeep | undefined { return this.rateMoveDeep; }
    getRateMoveShallow(): RateMoveShallow | undefined { return this.rateMoveShallow; }

}