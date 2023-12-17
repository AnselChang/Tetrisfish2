import GameStatus from "../../models/tetronimo-models/game-status";
import { fetchStackRabbitURL, getBestMoveFromMovelistNNBResponse, getBestMoveFromMovelistResponse } from "../../scripts/evaluation/evaluator";
import { EngineMovelistURL, LookaheadDepth, generateStandardParams } from "../../scripts/evaluation/stack-rabbit-api";
import { AbstractAIAdapter } from "../abstract-ai-adapter/abstract-ai-adapter";
import { BestMoveRequest } from "../abstract-ai-adapter/best-move-request";
import { BestMoveResponse } from "../abstract-ai-adapter/best-move-response";

export enum StackRabbitVariant {
    DEEP = "Deep",
    SHALLOW = "Shallow",
    NO_LOOKAHEAD = "NoLookahead",
}

export class StackRabbitAIAdapter extends AbstractAIAdapter {

    override getGenericName(): string {
        return "StackRabbit";
    }

    getName(variant: StackRabbitVariant): string {
        if (variant === StackRabbitVariant.NO_LOOKAHEAD) {
            return "StackRabbit (No Lookahead)";
        }
        return `StackRabbit (${variant})`;
    }

    getDescription(variant: StackRabbitVariant): string {
        const depth = (variant === StackRabbitVariant.DEEP) ? 3 : 2;
        return `Depth ${depth} tree search AI with hand tuned evaluation by Greg Cannon`
    }

    override getVariants(): string[] {
        return [StackRabbitVariant.DEEP, StackRabbitVariant.SHALLOW, StackRabbitVariant.NO_LOOKAHEAD];
    }

    override getVariantOptionString(variant: StackRabbitVariant): string {
        switch (variant) {
            case StackRabbitVariant.DEEP:
                return "Deep Search";
            case StackRabbitVariant.SHALLOW:
                return "Shallow Search";
            case StackRabbitVariant.NO_LOOKAHEAD:
                return "No Next Box";
        }
    }

    // make a StackRabbit engine-movelist request to find the best move
    async getBestMove(variant: StackRabbitVariant, request: BestMoveRequest): Promise<BestMoveResponse | undefined> {

        let depth: LookaheadDepth;
        switch (variant) {
            case StackRabbitVariant.DEEP:
            case StackRabbitVariant.NO_LOOKAHEAD:
                depth = LookaheadDepth.DEEP;
                break;
            case StackRabbitVariant.SHALLOW:
                depth = LookaheadDepth.SHALLOW;
                break;
        }
        
        let nextPieceType: string | undefined;
        if (variant === StackRabbitVariant.NO_LOOKAHEAD) {
            nextPieceType = undefined;
        } else {
            nextPieceType = request.nextPieceType;
        }

        const status = new GameStatus(request.level ?? 18, request.lines ?? 0, request.score ?? 0);
        const standardParams = generateStandardParams(request.board, request.currentPieceType, status, request.inputSpeed);
        const movelistURL = new EngineMovelistURL(standardParams, nextPieceType, depth).getURL();
        
        try {
            const response = await fetchStackRabbitURL(movelistURL);
            if (nextPieceType === undefined) {
                return getBestMoveFromMovelistNNBResponse(response, request.currentPieceType);
            }
            else {
                return getBestMoveFromMovelistResponse(response, request.currentPieceType, request.nextPieceType);
            }
        } catch (e) {
            console.error(e);
            return undefined;
        }
        
    }

};