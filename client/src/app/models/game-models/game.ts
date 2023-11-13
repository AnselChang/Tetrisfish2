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

export class Game {

    private placements: GamePlacement[] = [];

    // the most recent placement that has a rating
    public lastRatingNB$ = new BehaviorSubject<GamePlacement | undefined>(undefined);
    
    // the most recent placement that has been evaluated with engine-movelist
    public lastEngineMovelistNB$ = new BehaviorSubject<GamePlacement | undefined>(undefined);

    public status: SmartGameStatus;
    public readonly stats = new GameStats();
    public readonly analysisStats: GameAnalysisStats;

    constructor(public readonly startLevel: number, public readonly inputSpeed: InputSpeed) {
        this.status = new SmartGameStatus(startLevel);

        this.stats.trackTransitionLevel(startLevel + 1);
        if (startLevel < 18) this.stats.trackTransitionLevel(19);
        if (startLevel < 29) this.stats.trackTransitionLevel(29);

        this.analysisStats = new GameAnalysisStats(this.startLevel);

    }

    public get numPlacements(): number {
        return this.placements.length;
    }

    public getPlacementAt(index: number): GamePlacement {
        return this.placements[index];
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

    public addNewPosition(grid: BinaryGrid, currentPieceType: TetrominoType, nextPieceType: TetrominoType): GamePlacement {
        if (this.getLastPosition() && !this.getLastPosition()!.hasPlacement()) {
            throw new Error("Cannot add new position to game where the last state also had no placement");
        }

        this.stats.onPieceSpawn(currentPieceType);

        const newPlacement = new GamePlacement(this.placements.length, grid, currentPieceType, nextPieceType, this.status.copy());
        this.placements.push(newPlacement);

        // non-blocking fetch SR engine-movelist NB, set to placement analysis when it's done fetching 
        EngineMovelistNB.fetch(newPlacement, this.inputSpeed).then(engineMovelistNB => {
            newPlacement.analysis.setEngineMoveListNB(engineMovelistNB);

            // update most recent placement with engine-movelist NB if it's higher than the current one
            const lastPlacementMovelistNB = this.lastEngineMovelistNB$.getValue();
            if (!lastPlacementMovelistNB || lastPlacementMovelistNB.index < newPlacement.index) {
                this.lastEngineMovelistNB$.next(newPlacement);
            }
        });

        // // non-blocking fetch SR engine-movelist NNB, set to placement analysis when it's done fetching
        EngineMovelistNNB.fetch(newPlacement, this.inputSpeed).then(engineMovelistNNB => {
            newPlacement.analysis.setEngineMoveListNNB(engineMovelistNNB);
        });

        return newPlacement;
    }

    public setPlacementForLastPosition(moveableTetronimo: MoveableTetromino, numLineClears: number) {
        
        if (!this.getLastPosition()) throw new Error("Game has no positions to set placement for");
        if (this.getLastPosition()!.hasPlacement()) throw new Error("Last placement already has a placement");

        const placement = this.getLastPosition()!;
        placement.setPlacement(moveableTetronimo, numLineClears);

        // update game stats for placement
        this.status.onLineClear(numLineClears);
        this.stats.onLineClears(numLineClears);
        this.calculateTransitionScores();

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
        });

        //non-blocking fetch the engine rate-move shallow, set to placement analysis when it's done fetching
        RateMoveShallow.fetch(placement, this.inputSpeed).then(rateMoveShallow => {
            placement.analysis.setRateMoveShallow(rateMoveShallow);
        });
    }

    // if any of the flagged transition levels have been reached, set the transition score
    public calculateTransitionScores(): void {

        for (let transition of this.stats.getTransitionScores()) {
            if (this.status.level === transition.level && transition.score === undefined) {
                transition.score = this.status.score;
            }
        }
    }
}