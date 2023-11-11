export enum Rating {
    RAPID = 0,
    BEST = 1,
    GOOD = 2,
    MEDIOCRE = 3,
    INACCURACY = 4,
    MISTAKE = 5,
    BLUNDER = 6,
}

export const RATING_TO_COLOR: { [rating in Rating]: string } = {
    [Rating.RAPID] : "#63EAEA",
    [Rating.BEST] : "#58D774",
    [Rating.GOOD] : "#90D758",
    [Rating.MEDIOCRE] : "#A1A1A1",
    [Rating.INACCURACY] : "#E6DF3E",
    [Rating.MISTAKE] : "#D79558",
    [Rating.BLUNDER] : "#D75858",
};

export const RATING_TO_STRING: { [rating in Rating]: string } = {
    [Rating.RAPID] : "Rather Rapid",
    [Rating.BEST] : "Best",
    [Rating.GOOD] : "Good",
    [Rating.MEDIOCRE] : "Mediocre",
    [Rating.INACCURACY] : "Inaccuracy",
    [Rating.MISTAKE] : "Mistake",
    [Rating.BLUNDER] : "Blunder",
};


export function getRating(playerEval: number, bestEval: number) {
    const diff = playerEval - bestEval;
    if (diff > 0) return Rating.RAPID;
    if (diff >= -1) return Rating.BEST;
    if (diff >= -5) return Rating.GOOD;
    if (diff >= -12) return Rating.MEDIOCRE;
    if (diff >= -25) return Rating.INACCURACY;
    if (diff > -50) return Rating.MISTAKE;
    return Rating.BLUNDER;
}

// https://www.desmos.com/calculator/uu6r1csmee
// Graph to convert evaluation to between 0 and 1. 
// 40 eval is around 1, -83 eval is around 0.5
export function evaluationToPercent(evaluation: number): number {
    const percent = 1.4 / (1 + Math.exp(-0.02 * evaluation));
    
    // bound between 0 and 1
    return Math.min(1, Math.max(0, percent));
}