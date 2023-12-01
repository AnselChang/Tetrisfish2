export enum EvalFactor {
    SURFACE = 'surface',
    TETRIS_READY = 'tetrisReady',
    LINE_CLEAR = 'lineClear',
    BUILT_OUT_LEFT = 'builtOutLeft',
    UNABLE_TO_BURN = 'unableToBurn',
    GUARANTEED_BURNS = 'guaranteedBurns',
    HOLE = 'hole',
    HOLE_WEIGHT = 'holeWeight',
    EARLY_DOUBLE_WELL = 'earlyDoubleWell',
    COVERED_WELL = 'coveredWell',
    SPIRE_HEIGHT = 'spireHeight',
    INPUT_COST = 'inputCost',
}

export const ALL_EVAL_FACTORS = [
    EvalFactor.SURFACE,
    EvalFactor.TETRIS_READY,
    EvalFactor.LINE_CLEAR,
    EvalFactor.BUILT_OUT_LEFT,
    EvalFactor.UNABLE_TO_BURN,
    EvalFactor.GUARANTEED_BURNS,
    EvalFactor.HOLE,
    EvalFactor.HOLE_WEIGHT,
    EvalFactor.EARLY_DOUBLE_WELL,
    EvalFactor.COVERED_WELL,
    EvalFactor.SPIRE_HEIGHT,
    EvalFactor.INPUT_COST,
];

export class EvalFactors {

    private evalFactors: { [key in EvalFactor]: number } = {
        [EvalFactor.SURFACE]: 0,
        [EvalFactor.TETRIS_READY]: 0,
        [EvalFactor.LINE_CLEAR]: 0,
        [EvalFactor.BUILT_OUT_LEFT]: 0,
        [EvalFactor.UNABLE_TO_BURN]: 0,
        [EvalFactor.GUARANTEED_BURNS]: 0,
        [EvalFactor.HOLE]: 0,
        [EvalFactor.HOLE_WEIGHT]: 0,
        [EvalFactor.EARLY_DOUBLE_WELL]: 0,
        [EvalFactor.COVERED_WELL]: 0,
        [EvalFactor.SPIRE_HEIGHT]: 0,
        [EvalFactor.INPUT_COST]: 0,
    };

    constructor(rawEvalFactorsString: string) {
        const evalFactorsDict = this.parseEvalFactors(rawEvalFactorsString);

        // assign eval factors that are present in the raw string to the corresponding EvalFactor enum
        for (let factor of ALL_EVAL_FACTORS) {
            if (evalFactorsDict[factor]) {
                this.evalFactors[factor] = evalFactorsDict[factor];
                evalFactorsDict[factor] = 0;
            }
        }

        // check if there are any eval factors that were not assigned to an EvalFactor enum
        // if so, log a warning
        for (let factor in evalFactorsDict) {
            if (evalFactorsDict[factor] !== 0) {
                console.warn(`Unknown eval factor ${factor} with value ${evalFactorsDict[factor]}`);
            }
        }
    }

    // given a string of the format surface: 30.78, lineClear: 30.00...
    // return { surface: 30.78, lineClear: 30.00... }
    // ignore everything past newline
    private parseEvalFactors(input: string): { [key: string]: number } {
        const result: { [key: string]: number } = {};
        const pairs = input.split(',');
    
        for (let pair of pairs) {
            // Check for newline character and break if found
            if (pair.includes('\n')) {
                break;
            }
    
            const [key, valueStr] = pair.split(':');
            if (key && valueStr) {
                result[key.trim()] = parseFloat(valueStr.trim());
            }
        }
    
        return result;
    }

    getAllEvalFactors(): { [key in EvalFactor]: number } {
        return this.evalFactors;
    }

    getEvalFactorValue(factor: EvalFactor): number {
        return this.evalFactors[factor];
    }

}

