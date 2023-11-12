import { Average } from "../../misc/Average";
import { ALL_GAME_SPEEDS, GAME_SPEED_TO_STRING, GameSpeed as GameSpeed, RATING_TO_COLOR, getRating, getSpeedFromLevel } from "../evaluation-models/rating";
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
            if (speed >= startLevelSpeed) this.speedAccuracy.push([speed, new Average()]);
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
    public getAccuracyString(accuracy: Average): string {

        if (!accuracy.hasValues()) return "-";

        const value = accuracy.getAverage();
        return (value * 100).toFixed(2) + "%";
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

}