import { Rating } from "../evaluation-models/rating";
import { ALL_TETROMINO_TYPES, TetrominoType } from "../tetronimo-models/tetromino";
import { MoveRecommendation } from "./engine-movelist";


// Find whether one piece is particularly good/bad in evaluation
// if no outlier is found, return undefined
export function findOutliers(thirdPieceEvals: { [key in TetrominoType]: number }): {good: TetrominoType | undefined, bad: TetrominoType | undefined} {

    // the number of standard deviations away from the mean that a value must be to be considered an outlier
    const STANDARD_DEVIATION_THRESHOLD = 2.2;
        
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

    let badOutlier: TetrominoType | undefined = undefined;
    let goodOutlier: TetrominoType | undefined = undefined;

    // Find bad outlier
    const badThreshold = mean - STANDARD_DEVIATION_THRESHOLD * standardDeviation;
    for (const key of ALL_TETROMINO_TYPES) {
        if (thirdPieceEvals[key] < badThreshold) {
            if (badOutlier === undefined) {
                badOutlier = key as TetrominoType;
            } else {
                // More than one outlier found
                break;
            }
        }
    }

    // Find good outlier
    const goodThreshold = mean + STANDARD_DEVIATION_THRESHOLD * standardDeviation;
    for (const key of ALL_TETROMINO_TYPES) {
        if (thirdPieceEvals[key] > goodThreshold) {
            if (goodOutlier === undefined) {
                goodOutlier = key as TetrominoType;
            } else {
                // More than one outlier found
                break;
            }
        }
    }

    return {good: goodOutlier, bad: badOutlier};
}


// generate qualitative analysis for a rec, given all the other recs as well to be able to do comparisons
export function generateQualitativeAnalysis(allRecs: MoveRecommendation[], rec: MoveRecommendation): string | undefined {

    // Factors that can be used to generate qualitative analysis
    // 1. rating of the rec and its ranking among all recs
    // 2. best and worst third piece outliers, if they exist
    // 3. eval factors that are significantly higher/lower than average
    // 4. relevant tags

    const rating = rec.rating;
    const badEvalFactors = rec.evalFactors!.getBadEvalFactors();
    const goodEvalFactors = rec.evalFactors!.getGoodEvalFactors();

    const bestThirdPiece = rec.goodAccomPiece;

    // use worst third piece only if it's not an I piece, because how SR evaluates I pieces is weird sometimes
    let worstThirdPiece: TetrominoType | undefined = undefined;
    if (rec.badAccomPiece !== TetrominoType.I_TYPE) {
        // return `This placement doesn't leave a good spot for a future ${rec.badAccomPiece}.`;
        worstThirdPiece = rec.badAccomPiece;
    }
    

    return undefined;
}