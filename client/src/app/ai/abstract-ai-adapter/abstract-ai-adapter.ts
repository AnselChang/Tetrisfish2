// Generic class for defining a model for StackRabbit, Psycho, etc.
// An adapter class to convert custom api requests to a standardized format

import { BestMoveRequest } from "./best-move-request";
import { BestMoveResponse } from "./best-move-response";

export abstract class AbstractAIAdapter {

    abstract getGenericName(): string;
    abstract getName(variant: string): string;
    abstract getDescription(variant: string): string;

    getVariants(): string[] {
        return ["Default"];
    }

    getVariantOptionString(variant: string): string {
        return variant;
    }

    // given a request for a board position, return the best move according to that model
    // undefined if no possible moves
    abstract getBestMove(variant: string, request: BestMoveRequest): Promise<BestMoveResponse | undefined>;

}