export enum Rating {
    ERROR = -1,
    RAPID = 0,
    BEST = 1,
    GOOD = 2,
    MEDIOCRE = 3,
    INACCURACY = 4,
    MISTAKE = 5,
    BLUNDER = 6,
}

export const RATING_TO_COLOR: { [rating in Rating]: string } = {
    [Rating.ERROR] : "grey",
    [Rating.RAPID] : "#63EAEA",
    [Rating.BEST] : "#58D774",
    [Rating.GOOD] : "#90D758",
    [Rating.MEDIOCRE] : "#B3B3B3",
    [Rating.INACCURACY] : "#E6DF3E",
    [Rating.MISTAKE] : "#D79558",
    [Rating.BLUNDER] : "#D75858",
};

export const RATING_TO_STRING: { [rating in Rating]: string } = {
    [Rating.ERROR] : "Error",
    [Rating.RAPID] : "Rather Rapid",
    [Rating.BEST] : "Best",
    [Rating.GOOD] : "Good",
    [Rating.MEDIOCRE] : "Mediocre",
    [Rating.INACCURACY] : "Inaccuracy",
    [Rating.MISTAKE] : "Mistake",
    [Rating.BLUNDER] : "Blunder",
};


export function getRating(playerEvalMinusBestEval: number) {
    const diff = playerEvalMinusBestEval;
    if (diff > 0) return Rating.RAPID;
    if (diff >= -1) return Rating.BEST;
    if (diff >= -5) return Rating.GOOD;
    if (diff >= -12) return Rating.MEDIOCRE;
    if (diff >= -25) return Rating.INACCURACY;
    if (diff > -50) return Rating.MISTAKE;
    return Rating.BLUNDER;
}

// https://www.desmos.com/calculator/qrfk3vmily
// Graph to convert evaluation to between 0 and 1. 
export function evaluationToPercent(evaluation: number): number {
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
    if (level === 19) return GameSpeed.SPEED_19;
    return GameSpeed.SPEED_29;
}