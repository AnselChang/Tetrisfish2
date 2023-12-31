import { Subject } from "rxjs";
import { Average } from "../../misc/Average";
import { ALL_GAME_SPEEDS, GAME_SPEED_TO_STRING, GameSpeed as GameSpeed, RATING_TO_COLOR, Rating, absoluteEvaluationToPercent, getRatingFromAveragePercent, getRatingFromRelativeEval, getSpeedFromLevel, relativeEvaluationToPercent } from "../evaluation-models/rating";
import { ALL_TETROMINO_TYPES, TetrominoType } from "../tetronimo-models/tetromino";
import { GamePlacement } from "./game-placement";

// stores totals for each rating
export class RatingAggregator {

    private ratingTotals: Record<Rating, number> = {
        [Rating.ERROR]: 0,
        [Rating.BRILLIANT]: 0,
        [Rating.BEST]: 0,
        [Rating.GOOD]: 0,
        [Rating.MEDIOCRE]: 0,
        [Rating.INACCURACY]: 0,
        [Rating.MISTAKE]: 0,
        [Rating.BLUNDER]: 0,
    };

    public onRating(rating: Rating) {
        this.ratingTotals[rating]++;
    }

    public getRatingTotal(rating: Rating): number {
        return this.ratingTotals[rating];
    }
}

export class GameAnalysisStats {

    private overallAccuracy = new Average();
    private speedAccuracy: [GameSpeed, Average][] = [];
    private pieceAccuracy: Partial<Record<TetrominoType, Average>> = {};

    // track accuracy for when 100 lines is reached on 29 seperately for leaderboard
    private accuracy100LinesFor29? : number;
    private score100LinesFor29? : number;

    public speedAccuracyCache: [string, Average][] = [];
    public pieceAccuracyCache: [TetrominoType, Average][] = [];

    public readonly ratingAggregator = new RatingAggregator();
    
    constructor(public readonly startLevel: number) {

        // only store speed accuracies for speeds that are possible at the start level
        const startLevelSpeed = getSpeedFromLevel(startLevel);
        for (const speed of ALL_GAME_SPEEDS) {
            if (speed >= startLevelSpeed) {
                this.speedAccuracy.push([speed, new Average()]);
                console.log("Adding speed accuracy for speed " + speed);
            }
        }

        // store averages for all piece types
        for (const tetrominoType of ALL_TETROMINO_TYPES) {
            this.pieceAccuracy[tetrominoType] = new Average();
        }

    }

    public getSpeedAccuracy(speed: GameSpeed): Average | undefined {
        const accuracy = this.speedAccuracy.find(sa => sa[0] === speed);
        if (!accuracy) return undefined;
        return accuracy[1];
    }

    // update averages for accuracies for different aggregations
    public onRateMoveDeep(placement: GamePlacement) {

        const rating = placement.analysis.getRateMoveDeep();
        if (!rating) throw new Error("onPlacementEvaluated() called on placement without rating");

        // update rating aggregator
        this.ratingAggregator.onRating(rating.rating);

        // calculate the scaled accuracy from 0-1 for the rating
        if (rating.diff === undefined) return; // if undefined, meaning SR didn't recognize the move, skip this move
        const accuracy = rating.accuracy!;

        // update overall accuracy
        if (placement.statusBeforePlacement.level < 29 || this.startLevel >= 29) {
            // 29 accuracy does not count for games that start under 29
            this.overallAccuracy.push(accuracy);
        }

        // if just crossed 100 line mark on 29, set accuracy100LinesFor29
        if (this.startLevel === 29 && placement.statusAfterPlacement!.lines >= 100 && !this.accuracy100LinesFor29) {
            this.accuracy100LinesFor29 = this.overallAccuracy.getAverage();
            this.score100LinesFor29 = placement.statusAfterPlacement!.score;
        }
        
        // update accuracy for corresponding speed
        const speed = getSpeedFromLevel(placement.statusBeforePlacement.level);
        this.getSpeedAccuracy(speed)!.push(accuracy);

        // update accuracy for corresponding piece
        const piece = placement.currentPieceType;
        this.pieceAccuracy[piece]!.push(accuracy);

        this.calculateSpeedAccuracies();
        this.calculatePieceAccuracies();
    }

    public getAccuracy100LinesFor29(): number {
        if (this.accuracy100LinesFor29 !== undefined) return this.accuracy100LinesFor29;
        return this.overallAccuracy.getAverage();
    }

    public getScore100LinesFor29(): number {
        if (this.score100LinesFor29 !== undefined) return this.score100LinesFor29;
        return 0;
    }

    public is29Start(): boolean {
        return this.startLevel === 29;
    }

    // return as a number like "44.35%" or - for no values
    public getAccuracyString(accuracy: Average | number | undefined, round: number = 0): string {


        if (accuracy === undefined) return "-";

        if (typeof accuracy === "number") {
            return (accuracy * 100).toFixed(round) + "%";
        }

        if (!accuracy.hasValues()) return "0%";

        const average = accuracy.getAverage();
        return (average * 100).toFixed(round) + "%";
    }

    public getAccuracyColor(accuracy: Average | number | undefined): string {

        if (accuracy === undefined) return "white";

        if (typeof accuracy === "number") {
            const rating = getRatingFromAveragePercent(accuracy);
            return RATING_TO_COLOR[rating];
        }

        if (!accuracy.hasValues()) return "white";
        const rating = getRatingFromAveragePercent(accuracy.getAverage());
        return RATING_TO_COLOR[rating];
    }

    public getOverallAccuracy(): Average {
        return this.overallAccuracy;
    }

    public calculateSpeedAccuracies() {

        const result: [string, Average][] = [];
        for (const [speed, accuracy] of this.speedAccuracy) {
            result.push([GAME_SPEED_TO_STRING[speed], accuracy]);
        }
        this.speedAccuracyCache = result;
    }

    public getAccuracyForPiece(piece: TetrominoType): Average {
        return this.pieceAccuracy[piece]!;
    }

    public calculatePieceAccuracies() {
        const result: [TetrominoType, Average][] = [];
        for (const piece of ALL_TETROMINO_TYPES) {
            result.push([piece, this.getAccuracyForPiece(piece)]);
        }
        // sort descending with second element getAverage(). But if not hasValues(), put at the end
        result.sort((a, b) => {
            if (a[1].hasValues() && b[1].hasValues()) {
                return b[1].getAverage() - a[1].getAverage();
            } else if (a[1].hasValues()) {
                return Number.NEGATIVE_INFINITY;
            } else if (b[1].hasValues()) {
                return Number.POSITIVE_INFINITY;
            } else {
                return 0;
            }
        });
        this.pieceAccuracyCache = result;
    }
}