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

export function getColorForLevel(colorType: TetrominoColorType, level: number = 0): string {
    level = level % 10;
    
    // TODO: map level to color
    if (colorType === TetrominoColorType.COLOR_WHITE) {
        return 'rgb(255, 255, 255)';
    } else if (colorType === TetrominoColorType.COLOR_FIRST) {
        return 'rgb(36, 87, 239)';
    } else {
        return 'rgb(228, 75, 37)';
    }
}

export function getColorForTetrominoAndLevel(tetrominoType: TetrominoType, level: number): string {
    return getColorForLevel(getColorTypeForTetromino(tetrominoType), level);
}


// the four block sets for each rotation of the tetromino.
// 0 = no rotation, 1 = 90 degrees clockwise, 2 = 180 degrees clockwise, 3 = 270 degrees clockwise
export class Tetromino {

    public static readonly I_PIECE: Tetromino = new Tetromino(TetrominoType.I_TYPE, [
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
        ]),
    ]);

    // TODO: implement the rest of the pieces
    public static readonly J_PIECE: Tetromino;
    public static readonly L_PIECE: Tetromino;
    public static readonly O_PIECE: Tetromino;
    public static readonly S_PIECE: Tetromino;
    public static readonly T_PIECE: Tetromino;

    public static readonly ALL_PIECES: Tetromino[] = [
        Tetromino.I_PIECE,
        Tetromino.J_PIECE,
        Tetromino.L_PIECE,
        Tetromino.O_PIECE,
        Tetromino.S_PIECE, 
        Tetromino.T_PIECE];

    public static getPieceByType(type: TetrominoType): Tetromino {
        return Tetromino.ALL_PIECES.find(piece => piece.type === type)!;
    }

    constructor(public readonly type: TetrominoType,  public readonly blockSet: BlockSet[])
    {}
    
    public getBlockSet(rotation: number): BlockSet {
        return this.blockSet[rotation % this.blockSet.length];
    }

    public getColorForLevel(level: number): string {
        return getColorForTetrominoAndLevel(this.type, level);
    }
}

/*
For displaying the next piece in the next box. only stores the default rotation, and translations
are for half-mino increments to center the piece
// X is between 1 and 4, Y is between 1 and 2 inclusive
*/
export class TetrominoNB {

    public static readonly I_NB: TetrominoNB = new TetrominoNB(TetrominoType.I_TYPE, new BlockSet([
        new BlockPosition(2, 1.5),
        new BlockPosition(3, 1.5),
        new BlockPosition(4, 1.5),
        new BlockPosition(5, 1.5)
    ]));

    public static readonly T_NB: TetrominoNB = new TetrominoNB(TetrominoType.T_TYPE, new BlockSet([
        new BlockPosition(1.5, 1),
        new BlockPosition(2.5, 1),
        new BlockPosition(3.5, 1),
        new BlockPosition(2.5, 2)
    ]));

    public static readonly J_NB: TetrominoNB = new TetrominoNB(TetrominoType.J_TYPE, new BlockSet([
        new BlockPosition(1.5, 1),
        new BlockPosition(2.5, 1),
        new BlockPosition(3.5, 1),
        new BlockPosition(3.5, 2)
    ]));

    public static readonly L_NB: TetrominoNB = new TetrominoNB(TetrominoType.L_TYPE, new BlockSet([
        new BlockPosition(1.5, 1),
        new BlockPosition(2.5, 1),
        new BlockPosition(3.5, 1),
        new BlockPosition(1.5, 2)
    ]));

    public static readonly O_NB: TetrominoNB = new TetrominoNB(TetrominoType.O_TYPE, new BlockSet([
        new BlockPosition(2, 1),
        new BlockPosition(3, 1),
        new BlockPosition(2, 2),
        new BlockPosition(3, 2)
    ]));

    public static readonly S_NB: TetrominoNB = new TetrominoNB(TetrominoType.S_TYPE, new BlockSet([
        new BlockPosition(1.5, 1),
        new BlockPosition(2.5, 1),
        new BlockPosition(2.5, 2),
        new BlockPosition(3.5, 2)
    ]));

    public static readonly Z_NB: TetrominoNB = new TetrominoNB(TetrominoType.Z_TYPE, new BlockSet([
        new BlockPosition(1.5, 2),
        new BlockPosition(2.5, 2),
        new BlockPosition(2.5, 1),
        new BlockPosition(3.5, 1)
    ]));

    public static readonly ALL_NB: TetrominoNB[] = [
        TetrominoNB.I_NB,
        TetrominoNB.T_NB,
        TetrominoNB.J_NB,
        TetrominoNB.L_NB,
        TetrominoNB.O_NB,
        TetrominoNB.S_NB,
        TetrominoNB.Z_NB
    ];

    public static getPieceByType(type: TetrominoType): TetrominoNB {
        return TetrominoNB.ALL_NB.find(piece => piece.type === type)!;
    }

    constructor(public readonly type: TetrominoType, public readonly blockSet: BlockSet) {}
}