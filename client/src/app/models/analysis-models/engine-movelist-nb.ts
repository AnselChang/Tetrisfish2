/*
Deserializes SR engine-movelist NB request and stores as a model
The top 5 SR moves with 0 reaction time and both current/next piece
*/

import { fetchMovelist } from "../../scripts/evaluation/evaluator";
import { InputSpeed } from "../../scripts/evaluation/input-frame-timeline";
import { convertSRPlacement } from "../../scripts/evaluation/sr-placement-converter";
import { GamePlacement } from "../game-models/game-placement";
import MoveableTetromino from "../game-models/moveable-tetromino";

export class MoveRecommendation {
    constructor(
        public thisPiece: MoveableTetromino,
        public nextPiece: MoveableTetromino,
        public evaluation: number,
    ) {}

    public toString(): string {
        return `(${this.evaluation}) ${this.thisPiece.toString()} ${this.nextPiece.toString()}`;
    }
}

export default class EngineMovelistNB {

    static async fetch(placement: GamePlacement, inputSpeed: InputSpeed): Promise<EngineMovelistNB> {
        const response = await fetchMovelist(placement, inputSpeed, true);
        return new EngineMovelistNB(response, placement);
    }

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

    public getRecommendations(): MoveRecommendation[] {
        return this.recommendations;
    }
}