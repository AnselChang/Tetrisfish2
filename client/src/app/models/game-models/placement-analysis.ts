/*
Owned by a GamePlacement. A struct for all the SR analysis for the placement, including:
    - engine-movelist NB
    - engine-movelist NNB
    - rate-move deep
    - rate-move shallow
These are all optional, as we support lazy-loading of analysis data. Only the loaded data will
be shown.
*/

import EngineMovelistNB from "../analysis-models/engine-movelist-nb";
import EngineMovelistNNB from "../analysis-models/engine-movelist-nnb";
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

    setEngineMoveListNB(dict: any) { this.engineMovelistNB = new EngineMovelistNB(dict); }
    setEngineMoveListNNB(dict: any) { this.engineMovelistNNB = new EngineMovelistNNB(dict); }
    setRateMoveDeep(dict: any) { this.rateMoveDeep = new RateMoveDeep(dict); }
    setRateMoveShallow(dict: any) { this.rateMoveShallow = new RateMoveShallow(dict); }

    getEngineMoveListNB(): EngineMovelistNB | undefined { return this.engineMovelistNB; }
    getEngineMoveListNNB(): EngineMovelistNNB | undefined { return this.engineMovelistNNB; }
    getRateMoveDeep(): RateMoveDeep | undefined { return this.rateMoveDeep; }
    getRateMoveShallow(): RateMoveShallow | undefined { return this.rateMoveShallow; }

}