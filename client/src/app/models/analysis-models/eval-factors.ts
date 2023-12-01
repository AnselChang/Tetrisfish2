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
    AVG_HEIGHT = 'avgHeight',
    COL9 = 'col9',
    INACCESSIBLE_LEFT = 'inaccessibleLeft',
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
    EvalFactor.AVG_HEIGHT,
    EvalFactor.COL9,
    EvalFactor.INACCESSIBLE_LEFT,
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
        [EvalFactor.AVG_HEIGHT]: 0,
        [EvalFactor.COL9]: 0,
        [EvalFactor.INACCESSIBLE_LEFT]: 0,
    };

    private goodEvalFactors: EvalFactor[] = [];
    private badEvalFactors: EvalFactor[] = [];

    public assignImpactfulEvalFactors(goodFactors: EvalFactor[], badFactors: EvalFactor[]): void {
        this.goodEvalFactors = goodFactors;
        this.badEvalFactors = badFactors;
    }

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

    /* Return output is:
    Good: Surface (30.78), Line Clear (30.00),
    Bad: Hole (0.00), Hole Weight (0.00),
    */
    getImpactfulEvalsString(): string[] {
        let goodStr = 'Good: ';
        let badStr = 'Bad: ';

        for (let factor of this.goodEvalFactors) {
            goodStr += `${factor} (${this.evalFactors[factor].toFixed(2)}), `;
        }

        for (let factor of this.badEvalFactors) {
            badStr += `${factor} (${this.evalFactors[factor].toFixed(2)}), `;
        }

        return [goodStr, badStr];
    }

    getGoodEvalFactors(): EvalFactor[] {
        return this.goodEvalFactors;
    }

    getBadEvalFactors(): EvalFactor[] {
        return this.badEvalFactors;
    }

    // from the good eval factors, return the one that has the highest value
    getBestEvalFactor(): EvalFactor | undefined {
        let bestFactor: EvalFactor | undefined = undefined;
        let bestValue = -Infinity;

        for (let factor of this.goodEvalFactors) {
            if (this.evalFactors[factor] > bestValue) {
                bestFactor = factor;
                bestValue = this.evalFactors[factor];
            }
        }

        return bestFactor;
    }

    // from the bad eval factors, return the one that has the lowest value
    getWorstEvalFactor(): EvalFactor | undefined {
        let worstFactor: EvalFactor | undefined = undefined;
        let worstValue = Infinity;

        for (let factor of this.badEvalFactors) {
            if (this.evalFactors[factor] < worstValue) {
                worstFactor = factor;
                worstValue = this.evalFactors[factor];
            }
        }

        return worstFactor;
    }

}

