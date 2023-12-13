import { getSurfaceArray } from "../../machine-learning/board-surface";
import { depthTwoFakeMoveGeneration } from "../../machine-learning/fake-move-generation";
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
    DECISION_TREE_NORM = "decision_tree_norm",
    LASSO_REGRESSION_NORM = "lasso_regression_norm",
}

abstract class LeoAIAdapter extends AbstractAIAdapter {

    constructor(
        public readonly modelType: LeoModelTypes,
    ) {
        super();
    }

    private async getLeoEval(board: BinaryGrid): Promise<number> {

        const surfaceArray = getSurfaceArray(board);
        const {status, content} = await fetchServer(Method.POST, "/api/leo", {
            heights: surfaceArray
        });

        if (status !== 200) {
            throw new Error("Could not evaluate position");
        }

        return content[this.modelType] as number;

    }

    // make a StackRabbit engine-movelist request to find the best move
    async getBestMove(request: BestMoveRequest): Promise<BestMoveResponse | undefined> {

        // possiblePlacements are pairs of {firstPiecePlacement: MoveableTetromino, board: BinaryGrid}
        // where piece is the first piece placement
        // and board is the resulting board after BOTH pieces are placed
        // thus, there are multiple possible boards for each firstPiecePlacement
        const possiblePlacements = depthTwoFakeMoveGeneration(request.board, request.currentPieceType, request.nextPieceType);

        // find best firstPiecePlacement
        let bestEval = Number.NEGATIVE_INFINITY;
        let bestFirstPlacement: MoveableTetromino | undefined = undefined;
        let bestSecondPlacement: MoveableTetromino | undefined = undefined;
        for (const placement of possiblePlacements) {

            // evaluate the board
            const evaluation = await this.getLeoEval(placement.board);

            // update if its better than current best eval
            if (evaluation > bestEval) {
                bestEval = evaluation;
                bestFirstPlacement = placement.firstPiecePlacement;
                bestSecondPlacement = placement.secondPiecePlacement;
            }
        }

        // if no placements found, return undefined
        if (!bestFirstPlacement) return undefined;

        // otherwise, find return the best first piece placement
        return new BestMoveResponse(bestFirstPlacement, bestSecondPlacement, bestEval);
    }
};

export class LeoLRAdapter extends LeoAIAdapter {
    constructor() {
        super(LeoModelTypes.LINEAR_REGRESSION);
    }
    override getName() {
        return "Leo (LR)"
    }

    override getDescription() {
        return "Board surface evaluator using linear regression"
    }
}

export class LeoDTAdapter extends LeoAIAdapter {
    constructor() {
        super(LeoModelTypes.DECISION_TREE);
    }
    override getName() {
        return "Leo (DT)"
    }

    override getDescription() {
        return "Board surface evaluator using decision tree"
    }
}

export class LeoLassoAdapter extends LeoAIAdapter {
    constructor() {
        super(LeoModelTypes.LASSO_REGRESSION);
    }
    override getName() {
        return "Leo (Lasso)"
    }

    override getDescription() {
        return "Board surface evaluator using lasso regression"
    }
}

export class LeoLRNormAdapter extends LeoAIAdapter {
    constructor() {
        super(LeoModelTypes.LINEAR_REGRESSION_NORM);
    }
    override getName() {
        return "Leo (LR Norm)"
    }

    override getDescription() {
        return "Board surface evaluator using linear regression (normalized)"
    }
}

export class LeoDTNormAdapter extends LeoAIAdapter {
    constructor() {
        super(LeoModelTypes.DECISION_TREE_NORM);
    }
    override getName() {
        return "Leo (DT Norm)"
    }

    override getDescription() {
        return "Board surface evaluator using decision tree (normalized)"
    }
}

export class LeoLassoNormAdapter extends LeoAIAdapter {
    constructor() {
        super(LeoModelTypes.LASSO_REGRESSION_NORM);
    }
    override getName() {
        return "Leo (Lasso Norm)"
    }

    override getDescription() {
        return "Board surface evaluator using lasso regression (normalized)"
    }
}