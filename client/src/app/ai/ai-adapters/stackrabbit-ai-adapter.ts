import GameStatus from "../../models/tetronimo-models/game-status";
import { fetchStackRabbitURL, getBestMoveFromMovelistResponse } from "../../scripts/evaluation/evaluator";
import { EngineMovelistURL, LookaheadDepth, generateStandardParams } from "../../scripts/evaluation/stack-rabbit-api";
import { AbstractAIAdapter } from "../abstract-ai-adapter/abstract-ai-adapter";
import { BestMoveRequest } from "../abstract-ai-adapter/best-move-request";
import { BestMoveResponse } from "../abstract-ai-adapter/best-move-response";

export class StackRabbitAIAdapter extends AbstractAIAdapter {

    getName(): string {
        return "StackRabbit";
    }

    getDescription(): string {
        return "Depth 3 tree search AI with hand tuned evaluation by Greg Cannon"
    }

    // make a StackRabbit engine-movelist request to find the best move
    async getBestMove(request: BestMoveRequest): Promise<BestMoveResponse | undefined> {

        const status = new GameStatus(request.level ?? 18, request.lines ?? 0, request.score ?? 0);
        const standardParams = generateStandardParams(request.board, request.currentPieceType, status, request.inputSpeed);
        const movelistURL = new EngineMovelistURL(standardParams, request.nextPieceType, LookaheadDepth.DEEP).getURL();
        const response = await fetchStackRabbitURL(movelistURL);

        return getBestMoveFromMovelistResponse(response, request.currentPieceType, request.nextPieceType);

    }

};