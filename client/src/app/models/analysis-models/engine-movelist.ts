/*
Deserializes SR engine-movelist NB request and stores as a model
The top 5 SR moves with 0 reaction time and both current/next piece
*/

import { fetchMovelist } from "../../scripts/evaluation/evaluator";
import { InputSpeed } from "../../scripts/evaluation/input-frame-timeline";
import { convertSRPlacement } from "../../scripts/evaluation/sr-placement-converter";
import { RATING_TO_COLOR, getRatingFromRelativeEval } from "../evaluation-models/rating";
import { GamePlacement } from "../game-models/game-placement";
import MoveableTetromino from "../game-models/moveable-tetromino";

export class MoveRecommendation {
    constructor(
        public thisPiece: MoveableTetromino,
        public nextPiece: MoveableTetromino,
        public evaluation: number,
    ) {}

    public toString(): string {
        const evalStr = (this.evaluation > 0) ? `+${this.evaluation}` : `${this.evaluation}`;
        return `(${evalStr}) ${this.thisPiece.toString()} ${this.nextPiece.toString()}`;
    }
}

export abstract class EngineMovelist {
    protected recommendations: MoveRecommendation[] = [];

    public getRecommendations(): MoveRecommendation[] {
        return this.recommendations;
    }
}

// generates a list of best current piece + next piece placements given a game placement with current and next piece
export class EngineMovelistNB extends EngineMovelist {

    static async fetch(placement: GamePlacement, inputSpeed: InputSpeed): Promise<EngineMovelistNB> {
        const response = await fetchMovelist(placement, inputSpeed, true);
        return new EngineMovelistNB(response, placement);
    }

    // given a list of MT and a MT, check if the MT is already in the list
    private doesPlacementExist(placements: MoveableTetromino[], myPlacement: MoveableTetromino) {
        for (const placement of placements) {
            if (placement.equals(myPlacement)) return true;
        }
        return false;
    }

    constructor(moves: any, placement: GamePlacement) {
        super();
        // console.log("engine movelist nb created", moves);

        // filter out recs that have current piece already in that spot
        const firstPiecePlacements: MoveableTetromino[] = [];

        let i = 0;
        for (const move of moves) {
            const thisDict = move[0];
            const nextDict = move[1];

            const evaluation = nextDict["totalValue"];
            const thisPiece = convertSRPlacement(thisDict["placement"], placement.currentPieceType);
            const nextPiece = convertSRPlacement(nextDict["placement"], placement.nextPieceType);

            // check if the piece placement for the first piece is already in the list, if so skip
            if (this.doesPlacementExist(firstPiecePlacements, thisPiece)) continue;
            firstPiecePlacements.push(thisPiece);

            const recommendation = new MoveRecommendation(thisPiece, nextPiece, evaluation);
            this.recommendations.push(recommendation);

            i++;
        }
    }

    public get best(): MoveRecommendation {
        return this.recommendations[0];
    }

    public getRecommendationColor(recommendation: MoveRecommendation): string {
        const diff = recommendation.evaluation - this.best.evaluation;
        const rating = getRatingFromRelativeEval(diff);
        return RATING_TO_COLOR[rating];
    }

}

// Given only current piece, generate a list of best 
export class EngineMovelistNNB {

    static async fetch(placement: GamePlacement, inputSpeed: InputSpeed): Promise<EngineMovelistNNB> {
        const response = await fetchMovelist(placement, inputSpeed, false);
        return new EngineMovelistNNB();
    }
}