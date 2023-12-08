import MoveableTetromino from "../models/game-models/moveable-tetromino";
import BinaryGrid, { BlockType } from "../models/tetronimo-models/binary-grid";
import GameStatus from "../models/tetronimo-models/game-status";
import { TetrominoType } from "../models/tetronimo-models/tetromino";
import { fetchStackRabbitURL } from "../scripts/evaluation/evaluator";
import { InputSpeed } from "../scripts/evaluation/input-frame-timeline";
import { convertSRPlacement } from "../scripts/evaluation/sr-placement-converter";
import { EngineMovelistURL, LookaheadDepth, generateStandardParams } from "../scripts/evaluation/stack-rabbit-api";

/*
Given a board, and a current/next piece type, generate a labeled data point
by finding SR's recommended placements and evaluation.
The output is the resultant board after the placement, as well as the evaluation of the resultant board.
*/

export class EngineResponse {
    constructor(
        public readonly resultingBoard: BinaryGrid,
        public readonly evaluation: number,
        public readonly firstPiecePlacement: MoveableTetromino,
        public readonly secondPiecePlacement: MoveableTetromino,
    ) {}
}

export class MLPlacement {

    // whether this should be included into the ML dataset
    private isValidForML: boolean = false;

    private engineResponse?: EngineResponse;

    constructor(
        public readonly board: BinaryGrid,
        public readonly firstPieceType: TetrominoType,
        public readonly secondPieceType: TetrominoType,
    ) {}

    private generateMovelistURL(): string {
        
        const status = new GameStatus(18, 0, 0);
        const params = generateStandardParams(this.board, this.firstPieceType, status, InputSpeed.HZ_30);
        return new EngineMovelistURL(params, this.secondPieceType, LookaheadDepth.DEEP).getURL();
    }

    private processResponse(response: any) {

        const bestMove = response[0];
        const thisDict = bestMove[0];
        const nextDict = bestMove[1];

        // extract SR placements and evaluation
        const evaluation = nextDict["totalValue"] as number;
        const firstPlacement = convertSRPlacement(thisDict["placement"], this.firstPieceType);
        const secondPlacement = convertSRPlacement(nextDict["placement"], this.secondPieceType);

        // find resulting board by placing placements and hnadling line clears
        const resultingBoard = this.board.copy();
        firstPlacement.blitToGrid(resultingBoard);
        resultingBoard.processLineClears();
        secondPlacement.blitToGrid(resultingBoard);
        resultingBoard.processLineClears();

        this.engineResponse = new EngineResponse(resultingBoard, evaluation, firstPlacement, secondPlacement);
    }

    private isThereHoleInColumn(col: number): boolean {
        // first, find the lowest block in the column
        let lowestBlock = 0;
        for (let y = 0; y < 20; y++) {
            if (this.board.at(col, y) === BlockType.FILLED) {
                lowestBlock = y;
                break;
            }
        }

        // no blocks in column at all
        if (lowestBlock === 19) return false;

        // check if there is a hole in the column
        for (let y = lowestBlock + 1; y < 20; y++) {
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
                this.isValidForML = false;
                return false;
            }
        }
        return true;

    }

    // call this to evaluate the placement
    async runStackRabbit() {

        const url = this.generateMovelistURL();
        const response = await fetchStackRabbitURL(url);
        this.processResponse(response);

        this.isValidForML = this._isValidForML();
    }

    isBoardValidForML(): boolean {
        return this.isValidForML;
    }

    getEngineResponse(): EngineResponse | undefined {
        return this.engineResponse;
    }

}

