/*
Deserializes SR engine-movelist NB request and stores as a model
The top 5 SR moves with 0 reaction time and both current/next piece
*/

import { fetchMovelist, generateMoveListURL } from "../../scripts/evaluation/evaluator";
import { InputSpeed } from "../../scripts/evaluation/input-frame-timeline";
import { convertSRPlacement } from "../../scripts/evaluation/sr-placement-converter";
import { LookaheadDepth } from "../../scripts/evaluation/stack-rabbit-api";
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
        const response = await fetchMovelist(placement, inputSpeed, true, LookaheadDepth.DEEP);
        const apiURL = generateMoveListURL(placement, inputSpeed, true, LookaheadDepth.DEEP);
        return new EngineMovelistNB(response, placement, apiURL);
    }

    // given a list of MT and a MT, check if the MT is already in the list
    private doesPlacementExist(placements: MoveableTetromino[], myPlacement: MoveableTetromino) {
        for (const placement of placements) {
            if (placement.equals(myPlacement)) return true;
        }
        return false;
    }

    constructor(moves: any, placement: GamePlacement, public readonly apiURL: string) {
        super();
        // console.log("engine movelist nb created", moves);

        // map the moves to a list of MoveRecommendations
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

        // sort by evaluation, descending
        this.recommendations.sort((a, b) => b.evaluation - a.evaluation);

        // find all duplicate first piece placements
        const firstPiecePlacements: MoveableTetromino[] = [];
        const duplicatePlacements: MoveRecommendation[] = [];
        this.recommendations.forEach(recommendation => {
            if (this.doesPlacementExist(firstPiecePlacements, recommendation.thisPiece)) {
                duplicatePlacements.push(recommendation);
            } else {
                firstPiecePlacements.push(recommendation.thisPiece);
            }
        });

        // delete all duplicate first piece placements
        this.recommendations = this.recommendations.filter(recommendation => {
            return duplicatePlacements.indexOf(recommendation) === -1;
        });

        // for the best move, assign tags
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