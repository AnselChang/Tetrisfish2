import { Subject } from "rxjs";
import { Average } from "../../misc/Average";
import { ALL_GAME_SPEEDS, GAME_SPEED_TO_STRING, GameSpeed as GameSpeed, RATING_TO_COLOR, absoluteEvaluationToPercent, getRatingFromAveragePercent, getRatingFromRelativeEval, getSpeedFromLevel, relativeEvaluationToPercent } from "../evaluation-models/rating";
import { ALL_TETROMINO_TYPES, TetrominoType } from "../tetronimo-models/tetromino";
import { GamePlacement } from "./game-placement";

export class GameAnalysisStats {

    private overallAccuracy = new Average();
    private speedAccuracy: [GameSpeed, Average][] = [];
    private pieceAccuracy: Partial<Record<TetrominoType, Average>> = {};

    public speedAccuracyCache: [string, Average][] = [];
    public pieceAccuracyCache: [TetrominoType, Average][] = [];
    
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

    private getSpeedAccuracy(speed: GameSpeed): Average {
        const accuracy = this.speedAccuracy.find(sa => sa[0] === speed);
        if (!accuracy) throw new Error("No accuracy found for speed " + speed);
        return accuracy[1];
    }

    // update averages for accuracies for different aggregations
    public onRateMoveDeep(placement: GamePlacement) {

        const rating = placement.analysis.getRateMoveDeep();
        if (!rating) throw new Error("onPlacementEvaluated() called on placement without rating");

        // calculate the scaled accuracy from 0-1 for the rating
        if (rating.diff === undefined) return; // if undefined, meaning SR didn't recognize the move, skip this move
        const accuracy = relativeEvaluationToPercent(rating.diff);

        // update overall accuracy
        if (placement.statusBeforePlacement.level < 29 || this.startLevel >= 29) {
            // 29 accuracy does not count for games that start under 29
            this.overallAccuracy.push(accuracy);
        }
        
        // update accuracy for corresponding speed
        const speed = getSpeedFromLevel(placement.statusBeforePlacement.level);
        this.getSpeedAccuracy(speed).push(accuracy);

        // update accuracy for corresponding piece
        const piece = placement.currentPieceType;
        this.pieceAccuracy[piece]!.push(accuracy);

        this.calculateSpeedAccuracies();
        this.calculatePieceAccuracies();
    }

    // return as a number like "44.35%" or - for no values
    public getAccuracyString(accuracy: Average, round: number = 0): string {

        if (!accuracy.hasValues()) return "0%";

        const average = accuracy.getAverage();
        return (average * 100).toFixed(round) + "%";
    }

    public getAccuracyColor(accuracy: Average): string {
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