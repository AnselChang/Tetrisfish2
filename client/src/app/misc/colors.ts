export const TEXT_GREEN = "#58D774";
export const TEXT_RED = "#FF5151";

export enum EvaluationRating {
    BEST = 0,
    GOOD = 1,
    MEDIOCRE = 2,
    INACCURACY = 3,
    MISTAKE = 4,
    BLUNDER = 5,
}

export const EVALUATION_RATING_TO_COLOR: {[key in EvaluationRating] : string} = {
    [EvaluationRating.BEST]: "#58D774",
    [EvaluationRating.GOOD]: "#90D758",
    [EvaluationRating.MEDIOCRE]: "#A1A1A1",
    [EvaluationRating.INACCURACY]: "#E6DF3E",
    [EvaluationRating.MISTAKE]: "#D79558",
    [EvaluationRating.BLUNDER]: "#D75858",
};

export const EVALUATION_RATING_TO_STRING: {[key in EvaluationRating] : string} = {
    [EvaluationRating.BEST]: "Best",
    [EvaluationRating.GOOD]: "Good",
    [EvaluationRating.MEDIOCRE]: "Mediocre",
    [EvaluationRating.INACCURACY]: "Inaccuracy",
    [EvaluationRating.MISTAKE]: "Mistake",
    [EvaluationRating.BLUNDER]: "Blunder",
};