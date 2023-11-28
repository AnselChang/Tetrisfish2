/*
Owned by a GamePlacement. A struct for all the SR analysis for the placement, including:
    - engine-movelist NB
    - engine-movelist NNB
    - rate-move deep
    - rate-move shallow
These are all optional, as we support lazy-loading of analysis data. Only the loaded data will
be shown.
*/

import { BehaviorSubject, Subject } from "rxjs";
import { EngineMovelistNB, EngineMovelistNNB } from "../analysis-models/engine-movelist";
import { RateMoveDeep, RateMoveShallow } from "../analysis-models/rate-move";

export default class PlacementAnalysis {
    private engineMovelistDeep?: EngineMovelistNB;
    private engineMovelistShallow?: EngineMovelistNB;
    private rateMoveDeep?: RateMoveDeep;

    // subscribe to this to know when all four analysis requests are done
    public onFinishAnalysis$ = new BehaviorSubject<boolean>(false);

    private isFinishedAnalysis = false;
    private isStartedAnalysis = false;

    constructor(private readonly index: number) { }

    private updateAnalysisObservable() {
        if (this.isFinishedAnalysis) return;

        const finished = this.hasEngineMovelistDeep() && this.hasEngineMovelistShallow() && this.hasRateMoveDeep();
        if (finished) {
            this.isFinishedAnalysis = true;
            //console.log("Finished analysis for placement", this.index+1);
            this.onFinishAnalysis$.next(true);
        }
    }

    public flagStartedAnalysis() { this.isStartedAnalysis = true; }
    public flagFailedAnalysis() {
        this.isFinishedAnalysis = false; 
        this.isStartedAnalysis = false;
        this.engineMovelistDeep = undefined;
        this.engineMovelistShallow = undefined;
        this.rateMoveDeep = undefined;
    }
    public isAnalysisStarted(): boolean { return this.isStartedAnalysis; }
    public isAnalyisFinished(): boolean { return this.isFinishedAnalysis; }

    hasEngineMovelistDeep(): boolean { return this.engineMovelistDeep !== undefined; }
    hasEngineMovelistShallow(): boolean { return this.engineMovelistShallow !== undefined; }
    hasRateMoveDeep(): boolean { return this.rateMoveDeep !== undefined; }

    setEngineMoveListDeep(engineMovelistNB: EngineMovelistNB) { this.engineMovelistDeep = engineMovelistNB; this.updateAnalysisObservable(); }
    setEngineMoveListShallow(engineMovelistNB: EngineMovelistNB) { this.engineMovelistShallow = engineMovelistNB; this.updateAnalysisObservable(); }
    setRateMoveDeep(rateMoveDeep: RateMoveDeep) { this.rateMoveDeep = rateMoveDeep; this.updateAnalysisObservable(); }


    getEngineMoveListDeep(): EngineMovelistNB | undefined { return this.engineMovelistDeep; }
    getEngineMoveListShallow(): EngineMovelistNB | undefined { return this.engineMovelistShallow; }
    getRateMoveDeep(): RateMoveDeep | undefined { return this.rateMoveDeep; }

}