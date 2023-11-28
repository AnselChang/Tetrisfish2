/*
Deserializes SR engine-movelist NB request and stores as a model
The top 5 SR moves with 0 reaction time and both current/next piece
*/

import { fetchMovelist, generateMoveListURL } from "../../scripts/evaluation/evaluator";
import { InputSpeed } from "../../scripts/evaluation/input-frame-timeline";
import { convertSRPlacement } from "../../scripts/evaluation/sr-placement-converter";
import { LookaheadDepth } from "../../scripts/evaluation/stack-rabbit-api";
import { RATING_TO_COLOR, Rating, getRatingFromRelativeEval } from "../evaluation-models/rating";
import { GamePlacement } from "../game-models/game-placement";
import MoveableTetromino from "../game-models/moveable-tetromino";
import TagAssigner, { SimplePlacement } from "../tag-models/tag-assigner";
import { TagID } from "../tag-models/tag-types";

export class MoveRecommendation {

    private tags?: TagID[] = undefined;

    constructor(
        public thisPiece: MoveableTetromino,
        public nextPiece: MoveableTetromino,
        public evaluation: number,
    ) {}

    public assignTags(tags: TagID[]) {
        this.tags = tags;
    }

    public getTags(): TagID[] {
        if (!this.tags) {
            console.error("tags not assigned for this move recommendation");
            return [];
        }
        return this.tags;
    }

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

    static async fetch(placement: GamePlacement, inputSpeed: InputSpeed, depth: LookaheadDepth): Promise<EngineMovelistNB> {
        const response = await fetchMovelist(placement, inputSpeed, true, depth);
        const apiURL = generateMoveListURL(placement, inputSpeed, true, depth);
        return new EngineMovelistNB(response, placement, apiURL, depth);
    }

    // given a list of MT and a MT, check if the MT is already in the list
    private doesPlacementExist(placements: MoveableTetromino[], myPlacement: MoveableTetromino) {
        for (const placement of placements) {
            if (placement.equals(myPlacement)) return true;
        }
        return false;
    }

    constructor(moves: any, private readonly placement: GamePlacement, public readonly apiURL: string, public readonly depth: LookaheadDepth) {
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

        // If lookahead is deep, assign tags for all best moves
        if (this.depth === LookaheadDepth.DEEP) {
            this.recommendations.forEach(recommendation => {
                if (this.getRecommendationRating(recommendation) === Rating.BEST || this.getRecommendationRating(recommendation) === Rating.BRILLIANT) {
                    recommendation.assignTags(TagAssigner.assignTagsFor(new SimplePlacement(
                        this.placement.grid,
                        recommendation.thisPiece,
                        recommendation.nextPiece,
                    )));
                }
            });
        }
    }

    public get best(): MoveRecommendation {
        return this.recommendations[0];
    }

    public getRecommendationRating(recommendation: MoveRecommendation): Rating {
        const diff = recommendation.evaluation - this.best.evaluation;
        return getRatingFromRelativeEval(diff);
    }

    public getRecommendationColor(recommendation: MoveRecommendation): string {
        const rating = this.getRecommendationRating(recommendation);
        return RATING_TO_COLOR[rating];
    }

}

// Given only current piece, generate a list of best 
export class EngineMovelistNNB {

    static async fetch(placement: GamePlacement, inputSpeed: InputSpeed): Promise<EngineMovelistNNB> {
        const response = await fetchMovelist(placement, inputSpeed, false, LookaheadDepth.DEEP);
        return new EngineMovelistNNB();
    }
}