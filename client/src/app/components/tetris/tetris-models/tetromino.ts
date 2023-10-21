import { BlockPosition, BlockSet } from "./block";

export enum TetrominoType {
    I_TYPE = 'I',
    J_TYPE = 'J',
    L_TYPE = 'L',
    O_TYPE = 'O',
    S_TYPE = 'S',
    T_TYPE = 'T',
    Z_TYPE = 'Z'
}

export enum TetrominoColorType {
    COLOR_WHITE = 'COLOR_WHITE',
    COLOR_FIRST = 'COLOR_FIRST',
    COLOR_SECOND = 'COLOR_SECOND',
}

export function getColorTypeForTetromino(tetrominoType: TetrominoType): TetrominoColorType {
    switch (tetrominoType) {
        case TetrominoType.I_TYPE:
        case TetrominoType.O_TYPE:
        case TetrominoType.T_TYPE:
            return TetrominoColorType.COLOR_WHITE;
        case TetrominoType.J_TYPE:
        case TetrominoType.S_TYPE:
            return TetrominoColorType.COLOR_FIRST;
        default:
            return TetrominoColorType.COLOR_SECOND;
    }
}

export function getColorForLevel(colorType: TetrominoColorType, level: number): string {
    level = level % 10;
    
    // TODO: map level to color
    if (colorType === TetrominoColorType.COLOR_WHITE) {
        return 'white';
    } else if (colorType === TetrominoColorType.COLOR_FIRST) {
        return 'blue';
    } else {
        return 'red';
    }
}

export function getColorForTetrominoAndLevel(tetrominoType: TetrominoType, level: number): string {
    return getColorForLevel(getColorTypeForTetromino(tetrominoType), level);
}


// the four block sets for each rotation of the tetromino.
// 0 = no rotation, 1 = 90 degrees clockwise, 2 = 180 degrees clockwise, 3 = 270 degrees clockwise
export class Tetromino {
    constructor(public readonly type: TetrominoType,  public readonly blockSet: BlockSet[])
    {}
    
    public getBlockSet(rotation: number): BlockSet {
        return this.blockSet[rotation];
    }

    public getColorForLevel(level: number): string {
        return getColorForTetrominoAndLevel(this.type, level);
    }
}

// TODO: add all seven tetrominoes with correct block positions
export const I_PIECE = new Tetromino(TetrominoType.I_TYPE, [
    new BlockSet([
        new BlockPosition(0, 0),
        new BlockPosition(1, 0),
        new BlockPosition(2, 0),
        new BlockPosition(3, 0)
    ]),
    new BlockSet([
        new BlockPosition(1, 0),
        new BlockPosition(1, 1),
        new BlockPosition(1, 2),
        new BlockPosition(1, 3)
    ]),
    new BlockSet([
        new BlockPosition(0, 1),
        new BlockPosition(1, 1),
        new BlockPosition(2, 1),
        new BlockPosition(3, 1)
    ]),
    new BlockSet([
        new BlockPosition(2, 0),
        new BlockPosition(2, 1),
        new BlockPosition(2, 2),
        new BlockPosition(2, 3)
    ])
]);

//export const J_PIECE = ...

// TODO: add all seven tetrominoes to this array
export const TETROMINOS = [I_PIECE]