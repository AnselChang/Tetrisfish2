/*
The model for a full game, consisting of a list of placements optionally with evaluations
*/

import { BehaviorSubject } from "rxjs";
import { RateMoveDeep, RateMoveShallow } from "../analysis-models/rate-move";
import BinaryGrid from "../tetronimo-models/binary-grid";
import { SmartGameStatus } from "../tetronimo-models/smart-game-status";
import { TetrominoType } from "../tetronimo-models/tetromino";
import { GamePlacement } from "./game-placement";
import MoveableTetromino from "./moveable-tetromino";
import { GameStats } from "./game-stats";
import { GameAnalysisStats } from "./game-analysis-stats";
import { InputSpeed } from "../../scripts/evaluation/input-frame-timeline";
import { EngineMovelistNB, EngineMovelistNNB } from "../analysis-models/engine-movelist";
import GameEligibility from "./game-eligibility";
import { v4 as uuidv4 } from 'uuid';
import { TagID } from "../tag-models/tag-types";
import TagAssigner, { SimplePlacement } from "../tag-models/tag-assigner";

export class Game {

    // uuid v4 randomly generated id to uniquely identify the game
    public readonly gameID: string;

    private timestamp?: Date;

    private placements: GamePlacement[] = [];

    // the most recent placement that has a rating
    public lastRatingNB$ = new BehaviorSubject<GamePlacement | undefined>(undefined);

    // event that fires when the overall accuracy changes
    public onOverallAccuracyChange$ = new BehaviorSubject<number>(0);
    
    // the most recent placement that has been evaluated with engine-movelist
    public lastEngineMovelistNB$ = new BehaviorSubject<GamePlacement | undefined>(undefined);

    public status: SmartGameStatus;
    public readonly stats: GameStats;
    public readonly analysisStats: GameAnalysisStats;

    public eligibility: GameEligibility;

    constructor(public readonly startLevel: number, public readonly inputSpeed: InputSpeed, public readonly playerName: string, existingGameID?: string) {

        // if not recreating an existing game, generate a new uuid
        this.gameID = existingGameID ?? uuidv4();

        this.status = new SmartGameStatus(startLevel);

        let transitionLevelsToTrack = [startLevel+1];
        if (startLevel < 18) transitionLevelsToTrack.push(19);
        if (startLevel < 29) transitionLevelsToTrack.push(29);
        if (startLevel < 39) transitionLevelsToTrack.push(39);
        this.stats = new GameStats(transitionLevelsToTrack);

        this.analysisStats = new GameAnalysisStats(this.startLevel);
        this.eligibility = new GameEligibility(this.startLevel, inputSpeed);

    }

    public get numPlacements(): number {
        return this.placements.length;
    }

    public getPlacementAt(index: number): GamePlacement {
        return this.placements[index];
    }

    public setTimestamp(timestamp: Date): void {
        this.timestamp = timestamp;
    }

    public getTimestamp(): Date | undefined {
        return this.timestamp;
    }

    // pop last position if its placement is undefined.
    // called at end of game to make sure all placements are defined
    public popLastPositionIfUndefined(): void {
        if (this.getLastPosition() && !this.getLastPosition()!.hasPlacement()) {
            this.placements.pop();
            console.log("Popped last position because it had no placement");
        } else {
            console.log("Did not pop last position because it had a placement");
        }
    }

    // get the last position, which does not necessarily have a placement
    public getLastPosition(): GamePlacement | undefined {
        return this.placements[this.placements.length - 1];
    }

    // get the last position that has a placement
    public getLastPlacement(): GamePlacement | undefined {
        
        const lastPosition = this.getLastPosition();
        if (!lastPosition) return undefined;
        if (lastPosition.hasPlacement()) return lastPosition;
        if (this.placements.length < 2) return undefined;

        const secondLastPosition = this.placements[this.placements.length - 2];
        if (!secondLastPosition.hasPlacement()) throw new Error("Inconsistent state: last two positions both don't have placement");
        return secondLastPosition;
    }

    public addNewPosition(grid: BinaryGrid, currentPieceType: TetrominoType, nextPieceType: TetrominoType, runAnalysis: boolean = true): GamePlacement {
        if (this.getLastPosition() && !this.getLastPosition()!.hasPlacement()) {
            throw new Error("Cannot add new position to game where the last state also had no placement");
        }

        const newPlacement = new GamePlacement(this.placements.length, grid, currentPieceType, nextPieceType, this.status.copy());
        this.placements.push(newPlacement);

        if (runAnalysis) this.runPositionAnalysis(newPlacement);

        return newPlacement;

    }

    public runPositionAnalysis(position: GamePlacement) {

        // mark position as started analysis
        position.analysis.flagStartedAnalysis();

        // non-blocking fetch SR engine-movelist NB, set to placement analysis when it's done fetching 
        EngineMovelistNB.fetch(position, this.inputSpeed).then(engineMovelistNB => {
            position.analysis.setEngineMoveListNB(engineMovelistNB);

            // update most recent placement with engine-movelist NB if it's higher than the current one
            const lastPlacementMovelistNB = this.lastEngineMovelistNB$.getValue();
            if (!lastPlacementMovelistNB || lastPlacementMovelistNB.index < position.index) {
                this.lastEngineMovelistNB$.next(position);
            }
        }).catch(e => {
            console.log("Error fetching engine-movelist NB for placement #", position.index + 1);
            position.analysis.flagFailedAnalysis();
        });

        // // non-blocking fetch SR engine-movelist NNB, set to placement analysis when it's done fetching
        EngineMovelistNNB.fetch(position, this.inputSpeed).then(engineMovelistNNB => {
            position.analysis.setEngineMoveListNNB(engineMovelistNNB);
        }).catch(e => {
            console.log("Error fetching engine-movelist NNB for placement #", position.index + 1);
            position.analysis.flagFailedAnalysis();
        });
    }

    public setPlacementForLastPosition(moveableTetronimo: MoveableTetromino, numLineClears: number, runAnalysis: boolean = true) {
        
        if (!this.getLastPosition()) throw new Error("Game has no positions to set placement for");
        if (this.getLastPosition()!.hasPlacement()) throw new Error("Last placement already has a placement");

        const placement = this.getLastPosition()!;
        placement.setPlacement(moveableTetronimo, numLineClears);

        // update game stats for placement
        this.stats.onPiecePlacement(placement, numLineClears);
        this.status.onLineClear(numLineClears);
        this.calculateTransitionScores();

        if (this.startLevel < 29 && this.status.level >= 29) {
            this.eligibility.lockEligibility();
        }

        // run placement analysis
        if (runAnalysis) this.runPlacementAnalysis(placement);

    }

    public runPlacementAnalysis(placement: GamePlacement): void {

        // non-blocking fetch the engine rate-move deep, set to placement analysis when it's done fetching
        RateMoveDeep.fetch(placement, this.inputSpeed).then(rateMoveDeep => {
            placement.analysis.setRateMoveDeep(rateMoveDeep);

            // update most recent placement with rating NB if it's higher than the current one
            const lastPlacementRatingNB = this.lastRatingNB$.getValue();
            if (!lastPlacementRatingNB || lastPlacementRatingNB.index < placement.index) {
                this.lastRatingNB$.next(placement);
            }

            // update game analysis stats for placement
            this.analysisStats.onRateMoveDeep(placement);

            // update live leaderboard rank
            this.onOverallAccuracyChange$.next(this.analysisStats.getOverallAccuracy().getAverage());

        }).catch(e => {
            console.log("Error fetching rate-move deep for placement #", placement.index + 1);
            placement.analysis.flagFailedAnalysis();
        });

        //non-blocking fetch the engine rate-move shallow, set to placement analysis when it's done fetching
        RateMoveShallow.fetch(placement, this.inputSpeed).then(rateMoveShallow => {
            placement.analysis.setRateMoveShallow(rateMoveShallow);
        }).catch(e => {
            console.log("Error fetching rate-move shallow for placement #", placement.index + 1);
            placement.analysis.flagFailedAnalysis();
        });
    }

    public runFullAnalysis(placement: GamePlacement): void {
        this.runPositionAnalysis(placement);
        this.runPlacementAnalysis(placement);
    }

    // if any of the flagged transition levels have been reached, set the transition score
    public calculateTransitionScores(): void {

        for (let transition of this.stats.getTransitionScores()) {
            if (this.status.level === transition.level && transition.score === undefined) {
                transition.score = this.status.score;
            }
        }
    }

    public getCurrentScore(): number {
        return this.status.score;
    }

    public getCurrentLevel(): number {
        return this.status.level;
    }

    public getCurrentLines(): number {
        return this.status.lines;
    }

    public getAllPlacements(): GamePlacement[] {
        return this.placements;
    }
}