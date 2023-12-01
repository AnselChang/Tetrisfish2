import { MoveRecommendation } from "./engine-movelist";
import { ALL_EVAL_FACTORS, EvalFactor } from "./eval-factors";

// Utility function to initialize a map with all EvalFactor keys set to a given value.
function initializeFactorMap(value: number): { [key in EvalFactor]: number } {
    const map: { [key in EvalFactor]: number } = {} as any;
    for (const factor of ALL_EVAL_FACTORS) {
        map[factor] = value;
    }
    return map;
}

// Calculates and returns the average scores for each evaluation factor across all recommendations.
function calculateAverages(recommendations: MoveRecommendation[]): { [key in EvalFactor]: number } {
    const totals: { [key in EvalFactor]: number } = initializeFactorMap(0);

    // Sum up all the factor scores from each recommendation.
    recommendations.forEach(rec => {
        const factors = rec.evalFactors!.getAllEvalFactors();
        for (const factor of ALL_EVAL_FACTORS) {
            totals[factor] += factors[factor];
        }
    });

    // Calculate the average for each factor.
    const averages: { [key in EvalFactor]: number } = initializeFactorMap(0);
    for (const factor of ALL_EVAL_FACTORS) {
        averages[factor] = totals[factor] / recommendations.length;
    }

    return averages;
}

// Calculates and returns the standard deviation for each evaluation factor.
function calculateStandardDeviations(recommendations: MoveRecommendation[], averages: { [key in EvalFactor]: number }): { [key in EvalFactor]: number } {
    const sumOfSquares: { [key in EvalFactor]: number } = initializeFactorMap(0);

    // Sum up the squared differences from the mean for each factor.
    recommendations.forEach(rec => {
        const factors = rec.evalFactors!.getAllEvalFactors();
        for (const factor of ALL_EVAL_FACTORS) {
            sumOfSquares[factor] += Math.pow(factors[factor] - averages[factor], 2);
        }
    });

    // Calculate the standard deviation for each factor.
    const standardDeviations: { [key in EvalFactor]: number } = initializeFactorMap(0);
    for (const factor of ALL_EVAL_FACTORS) {
        standardDeviations[factor] = Math.sqrt(sumOfSquares[factor] / recommendations.length);
    }

    return standardDeviations;
}

// Generates a two lists of eval factors that are significantly lower/higher than average. 
export function findImpactfulEvalFactors(rec: MoveRecommendation, allRecs: MoveRecommendation[]): { higher: EvalFactor[], lower: EvalFactor[] } {

    // The number of standard deviations away from the mean that a value must be to be considered an outlier.
    const STANDARD_DEVIATION_THRESHOLD = 1.5;

    const higher: EvalFactor[] = [];
    const lower: EvalFactor[] = [];

    const averages: { [key in EvalFactor]: number } = calculateAverages(allRecs);
    const stdDeviations: { [key in EvalFactor]: number } = calculateStandardDeviations(allRecs, averages);

    // Compare each factor score of the move against the average and standard deviation.
    const factors = rec.evalFactors!.getAllEvalFactors();
    for (const factor of ALL_EVAL_FACTORS) {
        if (Math.abs(factors[factor] - averages[factor]) > STANDARD_DEVIATION_THRESHOLD * stdDeviations[factor]) {
            if (factors[factor] > averages[factor]) {
                higher.push(factor);
            } else {
                lower.push(factor);
            }
        }
    }

    // Return two separate lists: one for factors significantly higher and another for lower than the average.
    return { higher, lower };
}