import { ALL_TETROMINO_TYPES, TetrominoType } from "../tetronimo-models/tetromino";
import { MoveRecommendation } from "./engine-movelist";

// Find whether one piece is particularly bad in evaluation
// if no outlier is found, return undefined
export function findOutlier(thirdPieceEvals: { [key in TetrominoType]: number }): TetrominoType | undefined {

    // the number of standard deviations away from the mean that a value must be to be considered an outlier
    const STANDARD_DEVIATION_THRESHOLD = 2;
        
    // Calculate the mean
    let total = 0;
    for (const key of ALL_TETROMINO_TYPES) {
        total += thirdPieceEvals[key];
    }
    const mean = total / Object.keys(thirdPieceEvals).length;

    // Calculate the standard deviation
    let sumOfSquares = 0;
    for (const key of ALL_TETROMINO_TYPES) {
        sumOfSquares += Math.pow(thirdPieceEvals[key] - mean, 2);
    }
    const standardDeviation = Math.sqrt(sumOfSquares / Object.keys(thirdPieceEvals).length);

    // Find outlier
    let outlier: TetrominoType | undefined = undefined;
    for (const key of ALL_TETROMINO_TYPES) {
        if (thirdPieceEvals[key] < mean - STANDARD_DEVIATION_THRESHOLD * standardDeviation) {
            if (outlier === undefined) {
                outlier = key as TetrominoType;
            } else {
                // More than one outlier found
                return undefined;
            }
        }
    }

    return outlier;
}


// generate qualitative analysis for a rec, given all the other recs as well to be able to do comparisons
export function generateQualitativeAnalysis(allRecs: MoveRecommendation[], rec: MoveRecommendation): string | undefined {

    if (rec.badAccomPiece !== undefined) {
        return `This placement doesn't leave a good spot for a future ${rec.badAccomPiece}.`;
    }

    return undefined;
}