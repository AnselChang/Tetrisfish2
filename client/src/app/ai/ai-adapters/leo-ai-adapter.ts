import { getSurfaceArray } from "../../machine-learning/board-surface";
import { depthTwoFakeMoveGeneration } from "../../machine-learning/fake-move-generation";
import { findForcedBurnLines } from "../../machine-learning/find-forced-burn-rows";
import MoveableTetromino from "../../models/game-models/moveable-tetromino";
import BinaryGrid from "../../models/tetronimo-models/binary-grid";
import { Method, fetchServer } from "../../scripts/fetch-server";
import { AbstractAIAdapter } from "../abstract-ai-adapter/abstract-ai-adapter";
import { BestMoveRequest } from "../abstract-ai-adapter/best-move-request";
import { BestMoveResponse } from "../abstract-ai-adapter/best-move-response";

export enum LeoModelTypes {
    LINEAR_REGRESSION = "linear_regression",
    DECISION_TREE = "decision_tree",
    LASSO_REGRESSION = "lasso_regression",
    LINEAR_REGRESSION_NORM = "linear_regression_norm",
    LASSO_REGRESSION_NORM = "lasso_regression_norm",
}

export enum LeoTrainingSpeed {
    SPEED_18 = "18",
    SPEED_19 = "19",
    SPEED_29 = "29",
}

abstract class LeoAIAdapter extends AbstractAIAdapter {

    constructor(
        public readonly modelType: LeoModelTypes,
    ) {
        super();
    }

    override getVariants(): LeoTrainingSpeed[] {
        return [LeoTrainingSpeed.SPEED_18, LeoTrainingSpeed.SPEED_19, LeoTrainingSpeed.SPEED_29];
    }

    override getVariantOptionString(variant: LeoTrainingSpeed): string {
        switch (variant) {
            case LeoTrainingSpeed.SPEED_18:
                return "Trained on 18";
            case LeoTrainingSpeed.SPEED_19:
                return "Trained on 19";
            case LeoTrainingSpeed.SPEED_29:
                return "Trained on 29";
        }
    }


    // make a StackRabbit engine-movelist request to find the best move
    async getBestMove(variant: LeoTrainingSpeed, request: BestMoveRequest): Promise<BestMoveResponse | undefined> {

        // possiblePlacements are pairs of {firstPiecePlacement: MoveableTetromino, board: BinaryGrid}
        // where piece is the first piece placement
        // and board is the resulting board after BOTH pieces are placed
        // thus, there are multiple possible boards for each firstPiecePlacement
        let possiblePlacements = depthTwoFakeMoveGeneration(request.board, request.currentPieceType, request.nextPieceType);

        // if no placements found, return undefined
        if (possiblePlacements.length === 0) return undefined;

        // prune placements that do not have the minimum burned lines
        let minBurnedLines = 20;
        possiblePlacements.forEach(placement => {
            minBurnedLines = Math.min(minBurnedLines, findForcedBurnLines(placement.board, true).length);
        });
        possiblePlacements = possiblePlacements.filter(placement => findForcedBurnLines(placement.board, true).length === minBurnedLines);

        // console.log("After pruning, there are " + possiblePlacements.length + " placements with " + minBurnedLines + " burned lines");

        // get a list of all the heights of all the boards
        const heights = [];
        for (const placement of possiblePlacements) {
            const surfaceArray = getSurfaceArray(placement.board);
            heights.push(surfaceArray);
        }

        // console.log("Heights:", heights);

        const startTime = Date.now();

        const modelTypeWithVariant = this.modelType + "_" + variant;

        // POST /multi-predict
        const {status, content} = await fetchServer(Method.POST, "/api/leo", {
            heights: heights,
            model: modelTypeWithVariant,
        });
        // console.log("Leo AI took", Date.now() - startTime, "ms");

        if (status !== 200) {
            throw new Error("Could not evaluate position");
        }

        const evals = content["eval"] as any[];
        const timeElapsed = content["time_elapsed"] as number;

        // find best firstPiecePlacement
        let bestEval = Number.NEGATIVE_INFINITY;
        let bestFirstPlacement: MoveableTetromino | undefined = undefined;
        let bestSecondPlacement: MoveableTetromino | undefined = undefined;
        let i = 0;
        // console.log("leo time elapsed", timeElapsed, "s");
        for (const placement of possiblePlacements) {

            // evaluate the board
            const evaluation = evals[i];
            // console.log("eval", evaluation, "for placement", placement.firstPiecePlacement.toString(), placement.secondPiecePlacement.toString());
            //placement.firstPiecePlacement.print();
            //placement.secondPiecePlacement.print();

            // update if its better than current best eval
            if (evaluation > bestEval) {
                bestEval = evaluation;
                bestFirstPlacement = placement.firstPiecePlacement;
                bestSecondPlacement = placement.secondPiecePlacement;
            }

            i++;
        }

        // if no placements found, return undefined
        if (bestFirstPlacement === undefined || bestSecondPlacement === undefined) {
            console.log("Error: no best placement found");
            return undefined;
        }

        // console.log("best eval", bestEval);
        // bestFirstPlacement.print();
        // bestSecondPlacement.print();

        // otherwise, find return the best first piece placement
        return new BestMoveResponse(bestFirstPlacement, bestSecondPlacement, bestEval);
    }
};

export class LeoLRAdapter extends LeoAIAdapter {
    constructor() {
        super(LeoModelTypes.LINEAR_REGRESSION);
    }
    override getName(variant: LeoTrainingSpeed) {
        return `Leo (LR on ${variant})`
    }

    override getDescription(variant: LeoTrainingSpeed) {
        return `Board surface evaluator using linear regression trained on level ${variant}`
    }
}

export class LeoDTAdapter extends LeoAIAdapter {
    constructor() {
        super(LeoModelTypes.DECISION_TREE);
    }
    override getName(variant: LeoTrainingSpeed) {
        return `Leo (DT on ${variant})`
    }

    override getDescription(variant: LeoTrainingSpeed) {
        return `Board surface evaluator using decision tree trained on level ${variant}`
    }
}

export class LeoLassoAdapter extends LeoAIAdapter {
    constructor() {
        super(LeoModelTypes.LASSO_REGRESSION);
    }
    override getName(variant: LeoTrainingSpeed) {
        return `Leo (Lasso on ${variant})`
    }

    override getDescription(variant: LeoTrainingSpeed) {
        return `Board surface evaluator using lasso regression trained on level ${variant}`
    }
}