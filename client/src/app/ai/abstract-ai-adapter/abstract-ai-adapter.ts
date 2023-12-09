// Generic class for defining a model for StackRabbit, Psycho, etc.
// An adapter class to convert custom api requests to a standardized format

import { BestMoveRequest } from "./best-move-request";
import { BestMoveResponse } from "./best-move-response";

export abstract class AbstractAIAdapter {

    abstract getName(): string;

    // given a request for a board position, return the best move according to that model
    abstract getBestMove(request: BestMoveRequest): Promise<BestMoveResponse>;

}