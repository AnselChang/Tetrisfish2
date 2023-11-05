import { Block } from "blockly";
import { GamePosition } from "../../models/game-models/game-position";
import BinaryGrid, { BlockType } from "../../models/tetronimo-models/binary-grid";

class StandardParams {
    constructor(
        public board: string,
        public currentPiece: string,
        public level: number,
        public lines: number,
        public inputFrameTimeline: string,
    ) {}
}

abstract class StackRabbitURL {
    constructor(public params: StandardParams, public endpoint: string) {}

    abstract addParams(paramsObject: URLSearchParams): void;

    public getURL(): string {

        const baseUrl = 'https://stackrabbit.herokuapp.com';

        const queryParams = new URLSearchParams();
        queryParams.append('board', this.params.board);
        queryParams.append('currentPiece', this.params.currentPiece);
        queryParams.append('level', this.params.level.toString());
        queryParams.append('lines', this.params.lines.toString());
        queryParams.append('inputFrameTimeline', this.params.inputFrameTimeline);

        // add params specific to this URLParams subclass
        this.addParams(queryParams);

        return `${baseUrl}/${this.endpoint}?${queryParams.toString()}`;
    }

}

export class RateMoveURL extends StackRabbitURL {
    constructor(
        public override params: StandardParams,
        public secondBoard: string,
        public nextPiece: string,
        public lookaheadDepth: number, // 0 or 1
    ) {
        super(params, 'rate-move');
    }

    override addParams(paramsObject: URLSearchParams): void {
        paramsObject.append('secondBoard', this.secondBoard);
        paramsObject.append('nextPiece', this.nextPiece);
        paramsObject.append('lookaheadDepth', this.lookaheadDepth.toString());
    }
}

export class EngineMovelistURL extends StackRabbitURL {
    constructor(
        public override params: StandardParams,
        public nextPiece: string,
    ) {
        super(params, 'engine-movelist');
    }

    override addParams(paramsObject: URLSearchParams): void {
        paramsObject.append('nextPiece', this.nextPiece);
    }

}

// convert a BinaryGrid to a string formatted as 200 chars of 0s and 1s
export function boardToString(grid: BinaryGrid): string {
    let result = "";
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
            result += grid.at(x, y) === BlockType.FILLED ? "1" : "0";
        }
    }
    return result;
}

export function generateStandardParamsForPosition(position: GamePosition, inputFrameTimeline: string): StandardParams {
    return new StandardParams(
        boardToString(position.grid),
        position.currentPieceType,
        position.status.level,
        position.status.lines,
        inputFrameTimeline,
    );
}