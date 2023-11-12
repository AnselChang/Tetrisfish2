import { Average } from "../../misc/Average";
import { ALL_GAME_SPEEDS, GAME_SPEED_TO_STRING, GameSpeed as GameSpeed, RATING_TO_COLOR, evaluationToPercent, getRating, getSpeedFromLevel } from "../evaluation-models/rating";
import { ALL_TETROMINO_TYPES, TetrominoType } from "../tetronimo-models/tetromino";
import { GamePlacement } from "./game-placement";

export class GameAnalysisStats {

    private overallAccuracy = new Average();
    private speedAccuracy: [GameSpeed, Average][] = [];
    private pieceAccuracy: Partial<Record<TetrominoType, Average>> = {};
    
    constructor(startLevel: number) {

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

        // update overall accuracy
        this.overallAccuracy.push(rating.diff);

        // update accuracy for corresponding speed
        const speed = getSpeedFromLevel(placement.statusBeforePlacement.level);
        this.getSpeedAccuracy(speed).push(rating.diff);

        // update accuracy for corresponding piece
        const piece = placement.currentPieceType;
        this.pieceAccuracy[piece]!.push(rating.diff);
    }

    // return as a number like "44.35%" or - for no values
    public getAccuracyString(accuracy: Average, round: number = 0): string {

        if (!accuracy.hasValues()) return "0%";

        const average = accuracy.getAverage();
        const percent = evaluationToPercent(average);
        return (percent * 100).toFixed(round) + "%";
    }

    public getAccuracyColor(accuracy: Average): string {
        if (!accuracy.hasValues()) return "white";
        const rating = getRating(accuracy.getAverage());
        return RATING_TO_COLOR[rating];
    }

    public getOverallAccuracy(): Average {
        return this.overallAccuracy;
    }

    // return [speed as a string, accuracy as a string]
    public getSpeedAccuracies(): [string, Average][] {

        const result: [string, Average][] = [];
        for (const [speed, accuracy] of this.speedAccuracy) {
            result.push([GAME_SPEED_TO_STRING[speed], accuracy]);
        }
        return result;
    }

    public getAccuracyForPiece(piece: TetrominoType): Average {
        return this.pieceAccuracy[piece]!;
    }

    public getPieceAccuracies(): [TetrominoType, Average][] {
        const result: [TetrominoType, Average][] = [];
        for (const piece of ALL_TETROMINO_TYPES) {
            result.push([piece, this.getAccuracyForPiece(piece)]);
        }
        // sort descending on accuracy
        result.sort((a, b) => b[1].getSum() - a[1].getSum());
        return result;
    }
}