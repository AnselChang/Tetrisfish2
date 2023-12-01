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
import { TetrominoType } from "../tetronimo-models/tetromino";
import { findOutlier, generateQualitativeAnalysis } from "./evaluation-algorithms";

function charToTetrominoType(char: string): TetrominoType {
    switch (char) {
        case 'I': return TetrominoType.I_TYPE;
        case 'J': return TetrominoType.J_TYPE;
        case 'L': return TetrominoType.L_TYPE;
        case 'O': return TetrominoType.O_TYPE;
        case 'S': return TetrominoType.S_TYPE;
        case 'T': return TetrominoType.T_TYPE;
        case 'Z': return TetrominoType.Z_TYPE;
        default: throw new Error(`Invalid char ${char}`);
    }

}

export class MoveRecommendation {

    private tags?: TagID[] = undefined;
    public readonly badAccomPiece: TetrominoType | undefined;

    public rating!: Rating;
    public ratingColor!: string;
    public qualitativeAnalysis: string | undefined = undefined;

    constructor(
        public thisPiece: MoveableTetromino,
        public nextPiece: MoveableTetromino,
        public evaluation: number,
        public thirdPieceEvals: { [key in TetrominoType]: number } | undefined,
    ) {
        this.badAccomPiece = thirdPieceEvals ? findOutlier(thirdPieceEvals) : undefined;
    }

    public assignTags(tags: TagID[]) {
        this.tags = tags;
    }

    public getTags(): TagID[] {
        if (!this.tags) {
            return [];
        }
        return this.tags;
    }

    public toString(): string {
        const evalStr = (this.evaluation > 0) ? `+${this.evaluation}` : `${this.evaluation}`;
        return `(${evalStr}) ${this.thisPiece.toString()} ${this.nextPiece.toString()}`;
    }

}


// generates a list of best current piece + next piece placements given a game placement with current and next piece
export class EngineMovelistNB {

    private recommendations: MoveRecommendation[] = [];

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
        // console.log("engine movelist nb created", moves);

        // map the moves to a list of MoveRecommendations
        let i = 0;
        for (const move of moves) {
            const thisDict = move[0];
            const nextDict = move[1];

            const evaluation = nextDict["totalValue"];
            const thisPiece = convertSRPlacement(thisDict["placement"], placement.currentPieceType);
            const nextPiece = convertSRPlacement(nextDict["placement"], placement.nextPieceType);

            let thirdPieceEvals: any = undefined;
            if (depth === LookaheadDepth.DEEP) {
                
                thirdPieceEvals = {};
                const hypotheticalLines = nextDict["hypotheticalLines"];
                hypotheticalLines.forEach((piece: any) => {
                    thirdPieceEvals[charToTetrominoType(piece["pieceSequence"])] = piece["resultingValue"];
                });
                console.log("third piece evals", thirdPieceEvals);
            }

            const recommendation = new MoveRecommendation(thisPiece, nextPiece, evaluation, thirdPieceEvals);
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

        // assign ratings to each recommendation relative to the best recommendation
        this.recommendations.forEach(recommendation => {
            const diff = recommendation.evaluation - this.best.evaluation;
            recommendation.rating = getRatingFromRelativeEval(diff);
            recommendation.ratingColor = RATING_TO_COLOR[recommendation.rating];
        });

        // If lookahead is deep, assign tags for all best moves
        if (this.depth === LookaheadDepth.DEEP) {
            this.recommendations.forEach(recommendation => {
                if (recommendation.rating === Rating.BEST || recommendation.rating === Rating.BRILLIANT) {
                    recommendation.assignTags(TagAssigner.assignTagsFor(new SimplePlacement(
                        this.placement.grid,
                        recommendation.thisPiece,
                        recommendation.nextPiece,
                    )));
                }
            });
        }

        // get qualitative analysis for each recommendation.
        // because analysis may be relative to other recommendations, we do this only after all recommendations have been generated
        this.recommendations.forEach(recommendation => {
            recommendation.qualitativeAnalysis = generateQualitativeAnalysis(this.recommendations, recommendation);
        });
    }

    public getRecommendations(): MoveRecommendation[] {
        return this.recommendations;
    }

    public get best(): MoveRecommendation {
        return this.recommendations[0];
    }

}