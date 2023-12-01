import { Rating } from "../evaluation-models/rating";
import { getTagByID } from "../tag-models/tag-types";
import { ALL_TETROMINO_TYPES, TetrominoType } from "../tetronimo-models/tetromino";
import { MoveRecommendation } from "./engine-movelist";
import { EvalFactor } from "./eval-factors";
import { getNegativeEvalFactorPhrase, getNegativeNounEvalFactorPhrase, getPositiveEvalFactorPhrase } from "./qualitative-analysis-generation";


// Find whether one piece is particularly good/bad in evaluation
// if no outlier is found, return undefined
export function findOutliers(thirdPieceEvals: { [key in TetrominoType]: number }): {good: TetrominoType | undefined, bad: TetrominoType | undefined} {

    // the number of standard deviations away from the mean that a value must be to be considered an outlier
    const BAD_STANDARD_DEVIATION_THRESHOLD = 2.2;
    const GOOD_STANDARD_DEVIATION_THRESHOLD = 2.2;
        
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
    const badThreshold = mean - BAD_STANDARD_DEVIATION_THRESHOLD * standardDeviation;
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
    const goodThreshold = mean + GOOD_STANDARD_DEVIATION_THRESHOLD * standardDeviation;
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
    let bestEvalFactor = rec.evalFactors!.getBestEvalFactor();
    let worstEvalFactor = rec.evalFactors!.getWorstEvalFactor();

    if (bestEvalFactor === EvalFactor.INPUT_COST) bestEvalFactor = undefined;
    if (worstEvalFactor === EvalFactor.INPUT_COST || worstEvalFactor === EvalFactor.LINE_CLEAR) worstEvalFactor = undefined;
    
    // when I is best piece, not necessarily dependency but just waiting for tetris
    let bestThirdPiece = rec.goodAccomPiece;
    if (bestThirdPiece === TetrominoType.I_TYPE) bestThirdPiece = undefined;

    // use worst third piece only if it's not an I piece, because how SR evaluates I pieces is weird sometimes
    let worstThirdPiece: TetrominoType | undefined = undefined;
    if (rec.badAccomPiece !== TetrominoType.I_TYPE) {
        // return `This placement doesn't leave a good spot for a future ${rec.badAccomPiece}.`;
        worstThirdPiece = rec.badAccomPiece;
    }

    const tag = rec.getTags().length > 0 ? rec.getTags()[0] : undefined;
    const tagString = tag ? getTagByID(tag)?.titleName : undefined;
    const tagIsVowel = tagString ? ['a', 'e', 'i', 'o', 'u'].includes(tagString[0].toLowerCase()) : false;

    const sentiment = rating >= Rating.GOOD;

    if (bestEvalFactor === EvalFactor.TETRIS_READY) { // special case for tetris readiness
        if (sentiment) {
            if (tag) return `${tagString} is a nice find to get tetris ready.`;
            else return "Tetris readiness ensures the next bar isn't wasted.";
        } else {
            if (worstThirdPiece) return `Although this placement gets tetris ready, it doesn't leave a good spot for a future ${worstThirdPiece}.`;
            else if (worstEvalFactor) return `Tetris readiness isn't worth ${getNegativeNounEvalFactorPhrase(worstEvalFactor)}.`;
            else return "Tetris readiness is usually good, but not here.";
        }
    } else if (bestEvalFactor === EvalFactor.LINE_CLEAR) { // special case for tetrises

        if (rec.numLineClears !== 4) { // false positive, not a tetris actually
            bestEvalFactor = undefined;
        } else if (sentiment) {
            if (worstThirdPiece) return `Although the board isn't very accomodating for a ${worstThirdPiece}, scoring a tetris buys more time to resolve it later.`;
            else if (worstEvalFactor) return `Although ${getNegativeNounEvalFactorPhrase(worstEvalFactor)} isn't great, scoring a tetris buys more time to resolve it later.`;
            else return "Scoring a tetris is the most efficent way to score at the game.";
        } else {
            if (worstThirdPiece) return `Although a tetris is possible, it's more urgent to accomodate a possible future ${worstThirdPiece} piece.`;
            else if (worstEvalFactor) return `Although a tetris is possible, it ${getNegativeEvalFactorPhrase(worstEvalFactor)}.`;
            else return "Scoring a tetris is usually good, but not here.";
        }
    }

    // All possible permutations of bestEvalFactor/worstEvalFactor/worstThirdPiece
    if (bestEvalFactor && worstEvalFactor && worstThirdPiece) { // ignore tag, too many things to say

        if (sentiment) {
            return `Although this placement ${getNegativeEvalFactorPhrase(worstEvalFactor)}, it more importantly ${getPositiveEvalFactorPhrase(bestEvalFactor)}.`;
        } else {
            return `Although this placement ${getPositiveEvalFactorPhrase(bestEvalFactor)}, neither ${getPositiveEvalFactorPhrase(worstEvalFactor)} nor accomodates ${worstThirdPiece} pieces.`;
        }

    } else if (bestEvalFactor && worstEvalFactor) { // ignore tag, too many things to say

        if (sentiment) {
            return `Although this placement ${getNegativeEvalFactorPhrase(worstEvalFactor)}, it more importantly ${getPositiveEvalFactorPhrase(bestEvalFactor)}.`;
        } else {
            return `Although this placement ${getPositiveEvalFactorPhrase(bestEvalFactor)}, it ${getNegativeEvalFactorPhrase(worstEvalFactor)}.`;
        }

    } else if (bestEvalFactor && worstThirdPiece) { // ignore tag, too many things to say

        if (sentiment) {
            return `Although the resulting board isn't very accomodating for ${worstThirdPiece} pieces, it more importantly ${getPositiveEvalFactorPhrase(bestEvalFactor)}.`;
        } else {
            return `Although this placement ${getPositiveEvalFactorPhrase(bestEvalFactor)}, it doesn't accomodate ${worstThirdPiece} pieces.`;
        }

    } else if (worstEvalFactor && worstThirdPiece && !sentiment) {
        return `This placement not only ${getNegativeEvalFactorPhrase(worstEvalFactor)}, but also doesn't leave a good spot for ${worstThirdPiece} pieces.`

    } else if (bestEvalFactor && sentiment) { // since only one thing to say, can mention tag if it exists
        if (bestThirdPiece) return `Although this placement creates a ${bestThirdPiece} dependency, it more importantly ${getPositiveEvalFactorPhrase(bestEvalFactor)}.`;
        return `This placement ${getPositiveEvalFactorPhrase(bestEvalFactor)}.`

    } else if (worstEvalFactor && !sentiment) { // since only one thing to say, can mention tag if it exists
        if (tag) return `Doing ${tagString} here ${getNegativeEvalFactorPhrase(worstEvalFactor)}.`;
        else if (bestThirdPiece) return `This placement ${getNegativeEvalFactorPhrase(worstEvalFactor)} and creates a ${bestThirdPiece} dependency.`;
        else return `This placement ${getNegativeEvalFactorPhrase(worstEvalFactor)}.`;

    } else if (worstThirdPiece && !sentiment) {
        if (bestThirdPiece) return `This placement doesn't leave a good spot for a future ${worstThirdPiece}, and the resulting board is ${bestThirdPiece} dependent.`
        return `This placement doesn't leave a good spot for a future ${worstThirdPiece}.`

    } else { // no bestEvalFactor/worstEvalFactor/worstThirdPiece
        if (tag) {
            if (sentiment) {
                return `${tagString} is a nice find here.`;
            } else {
                return `${tagString} doesn't work well here.`;
            }
        } else if (bestThirdPiece) {
            if (!sentiment) return `This placement creates a ${bestThirdPiece} dependency.`;
        }
    }

    return undefined;
}