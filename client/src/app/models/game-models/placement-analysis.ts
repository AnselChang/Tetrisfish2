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
    private engineMovelistNB?: EngineMovelistNB;
    private engineMovelistNNB?: EngineMovelistNNB;
    private rateMoveDeep?: RateMoveDeep;
    private rateMoveShallow?: RateMoveShallow;

    // subscribe to this to know when all four analysis requests are done
    public onFinishAnalysis$ = new BehaviorSubject<boolean>(false);

    private isFinishedAnalysis = false;
    private isStartedAnalysis = false;

    constructor(private readonly index: number) { }

    private updateAnalysisObservable() {
        if (this.isFinishedAnalysis) return;

        const finished = this.hasEngineMovelistNB() && this.hasEngineMovelistNNB() && this.hasRateMoveDeep() && this.hasRateMoveShallow();
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
        this.engineMovelistNB = undefined;
        this.engineMovelistNNB = undefined;
        this.rateMoveDeep = undefined;
        this.rateMoveShallow = undefined;
    }
    public isAnalysisStarted(): boolean { return this.isStartedAnalysis; }
    public isAnalyisFinished(): boolean { return this.isFinishedAnalysis; }

    hasEngineMovelistNB(): boolean { return this.engineMovelistNB !== undefined; }
    hasEngineMovelistNNB(): boolean { return this.engineMovelistNNB !== undefined; }
    hasRateMoveDeep(): boolean { return this.rateMoveDeep !== undefined; }
    hasRateMoveShallow(): boolean { return this.rateMoveShallow !== undefined; }

    setEngineMoveListNB(engineMovelistNB: EngineMovelistNB) { this.engineMovelistNB = engineMovelistNB; this.updateAnalysisObservable(); }
    setEngineMoveListNNB(engineMovelistNNB: EngineMovelistNNB) { this.engineMovelistNNB = engineMovelistNNB; this.updateAnalysisObservable(); }
    setRateMoveDeep(rateMoveDeep: RateMoveDeep) { this.rateMoveDeep = rateMoveDeep; this.updateAnalysisObservable(); }
    setRateMoveShallow(rateMoveShallow: RateMoveShallow) { this.rateMoveShallow = rateMoveShallow; this.updateAnalysisObservable(); }


    getEngineMoveListNB(): EngineMovelistNB | undefined { return this.engineMovelistNB; }
    getEngineMoveListNNB(): EngineMovelistNNB | undefined { return this.engineMovelistNNB; }
    getRateMoveDeep(): RateMoveDeep | undefined { return this.rateMoveDeep; }
    getRateMoveShallow(): RateMoveShallow | undefined { return this.rateMoveShallow; }

}