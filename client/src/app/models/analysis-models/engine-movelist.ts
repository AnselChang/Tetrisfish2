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

    private recommendations: MoveRecommendation[] = [];

    constructor(moves: any, placement: GamePlacement) {
        // console.log("engine movelist nb created", moves);

        let i = 0;
        for (const move of moves) {
            const thisDict = move[0];
            const nextDict = move[1];

            const evaluation = nextDict["totalValue"];
            const thisPiece = convertSRPlacement(thisDict["placement"], placement.currentPieceType);
            const nextPiece = convertSRPlacement(nextDict["placement"], placement.nextPieceType);

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

    public getRecommendations(): MoveRecommendation[] {
        return this.recommendations;
    }
}

export class EngineMovelistNB extends EngineMovelist {

    static async fetch(placement: GamePlacement, inputSpeed: InputSpeed): Promise<EngineMovelistNB> {
        const response = await fetchMovelist(placement, inputSpeed, true);
        return new EngineMovelistNB(response, placement);
    }
}

export class EngineMovelistNNB {

    static async fetch(placement: GamePlacement, inputSpeed: InputSpeed): Promise<EngineMovelistNNB> {
        const response = await fetchMovelist(placement, inputSpeed, false);
        return new EngineMovelistNNB();
    }
}