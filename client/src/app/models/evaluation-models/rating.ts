export enum Rating {
    ERROR = -1,
    BRILLIANT = 0,
    BEST = 1,
    GOOD = 2,
    MEDIOCRE = 3,
    INACCURACY = 4,
    MISTAKE = 5,
    BLUNDER = 6,
}

export const ALL_VALID_RATINGS = [
    Rating.BRILLIANT,
    Rating.BEST,
    Rating.GOOD,
    Rating.MEDIOCRE,
    Rating.INACCURACY,
    Rating.MISTAKE,
    Rating.BLUNDER,
];

export const RATING_TO_COLOR: { [rating in Rating]: string } = {
    [Rating.ERROR] : "grey",
    [Rating.BRILLIANT] : "#B658D7",
    [Rating.BEST] : "#58D774",
    [Rating.GOOD] : "#90D758",
    [Rating.MEDIOCRE] : "#5892D7",
    [Rating.INACCURACY] : "#E6DF3E",
    [Rating.MISTAKE] : "#D79558",
    [Rating.BLUNDER] : "#D75858",
};

export const RATING_TO_STRING: { [rating in Rating]: string } = {
    [Rating.ERROR] : "Error",
    [Rating.BRILLIANT] : "Brilliant",
    [Rating.BEST] : "Best",
    [Rating.GOOD] : "Good",
    [Rating.MEDIOCRE] : "Mediocre",
    [Rating.INACCURACY] : "Inaccuracy",
    [Rating.MISTAKE] : "Mistake",
    [Rating.BLUNDER] : "Blunder",
};

// compute rating for a single move
export function getRatingFromRelativeEval(playerEvalMinusBestEval: number | undefined) {

    if (playerEvalMinusBestEval === undefined) return Rating.ERROR;

    const diff = playerEvalMinusBestEval!;
    // if (diff > 0) return Rating.RAPID;
    if (diff >= -1) return Rating.BEST;
    if (diff >= -4) return Rating.GOOD;
    if (diff >= -10) return Rating.MEDIOCRE;
    if (diff >= -25) return Rating.INACCURACY;
    if (diff > -50) return Rating.MISTAKE;
    return Rating.BLUNDER;
}

// compute rating given an average of percent from 0-1
export function getRatingFromAveragePercent(percent: number) {
    if (percent >= 0.95) return Rating.BRILLIANT;
    else if (percent >= 0.90) return Rating.BEST;
    else if (percent >= 0.80) return Rating.GOOD;
    else if (percent >= 0.70) return Rating.MEDIOCRE;
    else if (percent >= 0.60) return Rating.INACCURACY;
    else if (percent >= 0.50) return Rating.MISTAKE;
    else return Rating.BLUNDER;
}

// https://www.desmos.com/calculator/iukck84fgd
// Graph to convert RELATIVE evaluation to percent between 0 and 1
export function relativeEvaluationToPercent(playerEvalMinusBestEval: number): number {
    const percent = Math.pow(1.07, playerEvalMinusBestEval);

    // bound between 0 and 1
    return Math.min(1, Math.max(0, percent));
}

// https://www.desmos.com/calculator/qrfk3vmily
// Graph to convert ABSOLUTE evaluation to between 0 and 1. 
export function absoluteEvaluationToPercent(evaluation: number): number {
    const percent = 1.4 / (1 + Math.exp(-0.01 * (evaluation+25)));
    
    // bound between 0 and 1
    return Math.min(1, Math.max(0, percent));
}


export enum GameSpeed {
    SPEED_UNDER_18 = 0,
    SPEED_18 = 1,
    SPEED_19 = 2,
    SPEED_29 = 3,
}

export const ALL_GAME_SPEEDS = [
    GameSpeed.SPEED_UNDER_18,
    GameSpeed.SPEED_18,
    GameSpeed.SPEED_19,
    GameSpeed.SPEED_29,
];

export const GAME_SPEED_TO_STRING: { [speed in GameSpeed]: string } = {
    [GameSpeed.SPEED_UNDER_18] : "<18",
    [GameSpeed.SPEED_18] : "18",
    [GameSpeed.SPEED_19] : "19",
    [GameSpeed.SPEED_29] : "29",
};

export function getSpeedFromLevel(level: number): GameSpeed {
    if (level < 18) return GameSpeed.SPEED_UNDER_18;
    if (level === 18) return GameSpeed.SPEED_18;
    if (level < 29) return GameSpeed.SPEED_19;
    return GameSpeed.SPEED_29;
}