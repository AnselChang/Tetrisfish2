/*
Deserializes SR rate-move deep/shallow request and stores as a model
A numerical rating of a move considering both the current and next piece
rate-move returns a dictionary of the form:
{
    playerMoveNoAdjustment: number (player move's eval not considering next box),
    playerMoveAfterAdjustment: number (player move's eval considering next box),
    bestMoveNoAdjustment: number (best move's eval not considering next box),
    bestMoveAfterAdjustment: number (best move's eval considering next box),
}
*/

abstract class RateMove {
    constructor(dict: any) {
        
    }
}

export class RateMoveDeep extends RateMove {}
export class RateMoveShallow extends RateMove {}