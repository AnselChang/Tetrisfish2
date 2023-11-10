import { MoveRecommendation } from "../../models/analysis-models/move-recommendation";
import { GamePlacement } from "../../models/game-models/game-placement";
import { GamePosition } from "../../models/game-models/game-position";
import MoveableTetromino from "../../models/game-models/moveable-tetromino";
import { TetrominoType } from "../../models/tetronimo-models/tetromino";
import { Method, fetchServer } from "../fetch-server";
import { EngineMovelistURL, LookaheadDepth, RateMoveURL, boardToString, generateStandardParams } from "./stack-rabbit-api";

// a weird thing in greg's code where longbar is shifted one too low
function convertSRPlacement(type: TetrominoType, gregPlacement: [number, number, number]): {r: number, x: number, y: number} {
    const [r, x, y] = gregPlacement;

    if (type === TetrominoType.I_TYPE && r === 1) {
        return {r: 0, x: x, y: y - 1};
    }
    return {r: r, x: x, y: y};
}

async function fetchStackRabbitURL(url: string): Promise<any> {

    const result = await fetchServer(Method.GET, "/api/stackrabbit", {"url" : url});
    if (result.status !== 200) {
        throw new Error("Could not evaluate position");
    }
    return result.content;
}

export async function fetchMovelist(position: GamePosition, inputFrameTimeline: string, useNextBox: boolean): Promise<any> {

    // Generate the common portion of the URL
    const params = generateStandardParams(position.grid, position.currentPieceType, position.status, inputFrameTimeline);

    // Make engine-movelist request
    const movelistURL = new EngineMovelistURL(params, useNextBox ? position.nextPieceType : undefined).getURL();
    return fetchStackRabbitURL(movelistURL);
}

export async function fetchRateMove(placement: GamePlacement, inputFrameTimeline: string, lookaheadDepth: LookaheadDepth) {

    // Generate the common portion of the URL
    const params = generateStandardParams(placement.grid, placement.piecePlacement.tetrominoType, placement.status, inputFrameTimeline);

    // Make rate-move request
    const boardWithPlacement = placement.getGridWithPlacement();
    boardWithPlacement.processLineClears();
    const rateMoveURL = new RateMoveURL(params, boardToString(boardWithPlacement), placement.nextPieceType, lookaheadDepth).getURL();
    return fetchStackRabbitURL(rateMoveURL);
}


export async function evaluatePosition(position: GamePosition, inputFrameTimeline: string, nextBox: boolean): Promise<MoveRecommendation[]> {

const content = await fetchMovelist(position, inputFrameTimeline, nextBox);

// Process top 5 moves from engine-movelist request
const recommendations: MoveRecommendation[] = [];
let rank = 0;
for (let move of content) {

    console.log("move:", move);

    console.log("1 placement", move[0].placement);

    // get the placement of the current and next pieces for this move
    const currentPlacement = convertSRPlacement(position.currentPieceType, move[0].placement);
    const currentTetronimo = new MoveableTetromino(position.currentPieceType, currentPlacement.r, currentPlacement.x, currentPlacement.y);
    const nextPlacement = convertSRPlacement(position.nextPieceType, move[1].placement);
    const nextTetronimo = new MoveableTetromino(position.nextPieceType, nextPlacement.r, nextPlacement.x, nextPlacement.y);
    
    // get the evaluation for this move
    const evaluation: number = move[0]["totalValue"];

    // add the move to the list of recommendations
    recommendations.push(new MoveRecommendation(rank, currentTetronimo, nextTetronimo, evaluation));

    // increment the rank, and stop if we have enough recommendations
    rank++;
    if (rank >= 5) break;
}

return recommendations;
}
