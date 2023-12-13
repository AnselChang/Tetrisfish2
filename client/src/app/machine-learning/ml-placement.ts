import { BestMoveResponse } from "../ai/abstract-ai-adapter/best-move-response";
import BinaryGrid, { BlockType } from "../models/tetronimo-models/binary-grid";
import GameStatus from "../models/tetronimo-models/game-status";
import { TetrominoType } from "../models/tetronimo-models/tetromino";
import { fetchStackRabbitURL, getBestMoveFromMovelistResponse } from "../scripts/evaluation/evaluator";
import { InputSpeed } from "../scripts/evaluation/input-frame-timeline";
import { EngineMovelistURL, EvalBoardURL, LookaheadDepth, generateStandardParams } from "../scripts/evaluation/stack-rabbit-api";
import { Method, fetchServer } from "../scripts/fetch-server";
import { getSurfaceArray } from "./board-surface";

/*
Given a board, and a current/next piece type, generate a labeled data point
by finding SR's recommended placements and evaluation.
The output is the resultant board after the placement, as well as the evaluation of the resultant board.
*/

export class SRRawEvalResponse {
    constructor(
        public readonly rawEvaluation: number,
    ) {}
}

// a single data point for ML training. consists of a 10-element surface array, which contains heights 0-20 for each column
// also contains the RAW SR eval for that board
export interface MLDataPoint {
    surface: number[];
    eval: number;
}

export class MLPlacement {

    // whether this should be included into the ML dataset
    private readonly isValidForML: boolean;
    private dataPoint?: MLDataPoint;

    private bestMoveResponse?: BestMoveResponse;
    private rawEvalResponse?: SRRawEvalResponse;

    constructor(
        public readonly board: BinaryGrid,
        public readonly firstPieceType: TetrominoType,
        public readonly secondPieceType: TetrominoType,
    ) {
        this.isValidForML = this._isValidForML();
    }

    private generateEvalURL(): string {
        
        const status = new GameStatus(18, 0, 0);
        const params = generateStandardParams(this.board, undefined, status, InputSpeed.HZ_30);
        return new EvalBoardURL(params).getURL();
    }

    private generateMovelistURL(): string {
        const status = new GameStatus(18, 0, 0);
        const params = generateStandardParams(this.board, this.firstPieceType, status, InputSpeed.HZ_30);
        return new EngineMovelistURL(params, this.secondPieceType, LookaheadDepth.DEEP).getURL();
    }

    private isThereHoleInColumn(col: number): boolean {
        // first, find the lowest block in the column
        let lastEmptyBlock = -1;
        for (let y = 0; y < 20; y++) {
            if (this.board.at(col, y) === BlockType.FILLED) {
                break;
            } else {
                lastEmptyBlock = y;
            }
        }


        // check if there is a hole in the column
        for (let y = lastEmptyBlock + 1; y < 20; y++) {
            if (this.board.at(col, y) === BlockType.EMPTY) return true;
        }

        return false;
    }

    /*
    Any holes, besides in right column, are not valid for ML
    */
    private _isValidForML(): boolean {

        for (let x = 0; x < 9; x++) { // ignore right column
            if (this.isThereHoleInColumn(x)) {
                console.log("hole in column", x);
                return false;
            }
        }
        return true;
    }

    // call this to evaluate the placement
    async runSRBestMove() {

        const url = this.generateMovelistURL();
        console.log("eval url", url);
        const response = await fetchStackRabbitURL(url);
        this.bestMoveResponse = getBestMoveFromMovelistResponse(response, this.firstPieceType, this.secondPieceType);
    }

    async runSRRawEval() {
            
        const url = this.generateEvalURL();
        console.log("eval url", url);
        const {status, content} = await fetchServer(Method.GET, "/api/stackrabbit-wrapped",
            {"url": url}
        );

        if (status !== 200) return;
        const rawEval = content["data"] as number;

        if (rawEval === undefined) return;

        this.rawEvalResponse = new SRRawEvalResponse(rawEval);

        if (this.isBoardValidForML()) {
            this.dataPoint = {
                surface: getSurfaceArray(this.board),
                eval: rawEval,
            }
        }
        
    }

    isBoardValidForML(): boolean {
        return this.isValidForML;
    }

    getEngineResponse(): BestMoveResponse | undefined {
        return this.bestMoveResponse;
    }

    getRawEvalResponse(): SRRawEvalResponse | undefined {
        return this.rawEvalResponse;
    }

    getDataPoint(): MLDataPoint | undefined {
        return this.dataPoint;
    }

}

