import { GamePlacement } from "../../models/game-models/game-placement";
import MoveableTetromino from "../../models/game-models/moveable-tetromino";
import { TetrominoType } from "../../models/tetronimo-models/tetromino";
import { Method, fetchServer } from "../fetch-server";
import { InputSpeed } from "./input-frame-timeline";
import { EngineMovelistURL, LookaheadDepth, RateMoveURL, boardToString, generateStandardParams } from "./stack-rabbit-api";


async function fetchStackRabbitURL(url: string): Promise<any> {

    const result = await fetchServer(Method.GET, "/api/stackrabbit", {"url" : url});
    if (result.status !== 200) {
        throw new Error("Could not evaluate position");
    }
    return result.content;
}

// returns the raw dictionary from the StackRabbit engine-movelist request
export async function fetchMovelist(placement: GamePlacement, inputSpeed: InputSpeed, useNextBox: boolean): Promise<any> {

    // Generate the common portion of the URL
    const params = generateStandardParams(placement.grid, placement.currentPieceType, placement.statusBeforePlacement!, inputSpeed);

    // Make engine-movelist request
    const movelistURL = new EngineMovelistURL(params, useNextBox ? placement.nextPieceType : undefined).getURL();
    return fetchStackRabbitURL(movelistURL);
}

// returns the raw dictionary from the StackRabbit rate-move request
export async function fetchRateMove(placement: GamePlacement, inputSpeed: InputSpeed, lookaheadDepth: LookaheadDepth) {

    // Generate the common portion of the URL
    const params = generateStandardParams(placement.grid, placement.currentPieceType, placement.statusBeforePlacement!, inputSpeed);

    // Make rate-move request
    const boardWithPlacement = placement.getGridWithPlacement();
    boardWithPlacement.processLineClears();
    const rateMoveURL = new RateMoveURL(params, boardToString(boardWithPlacement), placement.nextPieceType, lookaheadDepth).getURL();
    return fetchStackRabbitURL(rateMoveURL);
}
