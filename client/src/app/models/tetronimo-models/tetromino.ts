import { Binary } from "@angular/compiler";
import BinaryGrid from "./binary-grid";
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

export const ALL_TETROMINO_TYPES: TetrominoType[] = [
    TetrominoType.I_TYPE,
    TetrominoType.J_TYPE,
    TetrominoType.L_TYPE,
    TetrominoType.O_TYPE,
    TetrominoType.S_TYPE,
    TetrominoType.T_TYPE,
    TetrominoType.Z_TYPE
];

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
// always positioned as leftmost and topmost as possible
export class Tetromino {

    public static readonly I_PIECE: Tetromino = new Tetromino(TetrominoType.I_TYPE, [
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(1, 0),
            new BlockPosition(2, 0),
            new BlockPosition(3, 0)
        ]),
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(0, 1),
            new BlockPosition(0, 2),
            new BlockPosition(0, 3)
        ]),
    ]);

    public static readonly J_PIECE: Tetromino = new Tetromino(TetrominoType.J_TYPE, [
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(1, 0),
            new BlockPosition(2, 0),
            new BlockPosition(2, 1),
        ]),
        new BlockSet([
            new BlockPosition(1, 0),
            new BlockPosition(1, 1),
            new BlockPosition(1, 2),
            new BlockPosition(0, 2),
        ]),
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(0, 1),
            new BlockPosition(1, 1),
            new BlockPosition(2, 1),
        ]),
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(1, 0),
            new BlockPosition(0, 1),
            new BlockPosition(0, 2),
        ]),
    ]);

    public static readonly L_PIECE: Tetromino = new Tetromino(TetrominoType.L_TYPE, [
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(1, 0),
            new BlockPosition(2, 0),
            new BlockPosition(0, 1),
        ]),
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(1, 0),
            new BlockPosition(1, 1),
            new BlockPosition(1, 2),
        ]),
        new BlockSet([
            new BlockPosition(2, 0),
            new BlockPosition(2, 1),
            new BlockPosition(1, 1),
            new BlockPosition(0, 1),
        ]),
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(0, 1),
            new BlockPosition(0, 2),
            new BlockPosition(1, 2),
        ]),
    ]);

    public static readonly O_PIECE: Tetromino = new Tetromino(TetrominoType.O_TYPE, [
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(1, 0),
            new BlockPosition(0, 1),
            new BlockPosition(1, 1),
        ]),
    ]);

    public static readonly S_PIECE: Tetromino = new Tetromino(TetrominoType.S_TYPE, [
        new BlockSet([
            new BlockPosition(1, 0),
            new BlockPosition(2, 0),
            new BlockPosition(1, 1),
            new BlockPosition(0, 1),
        ]),
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(0, 1),
            new BlockPosition(1, 1),
            new BlockPosition(1, 2),
        ]),
    ]);

    public static readonly Z_PIECE: Tetromino = new Tetromino(TetrominoType.Z_TYPE, [
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(1, 0),
            new BlockPosition(1, 1),
            new BlockPosition(2, 1),
        ]),
        new BlockSet([
            new BlockPosition(1, 0),
            new BlockPosition(1, 1),
            new BlockPosition(0, 1),
            new BlockPosition(0, 2),
        ]),
    ]);

    public static readonly T_PIECE: Tetromino = new Tetromino(TetrominoType.T_TYPE, [
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(1, 0),
            new BlockPosition(2, 0),
            new BlockPosition(1, 1),
        ]),
        new BlockSet([
            new BlockPosition(1, 0),
            new BlockPosition(1, 1),
            new BlockPosition(1, 2),
            new BlockPosition(0, 1),
        ]),
        new BlockSet([
            new BlockPosition(1, 0),
            new BlockPosition(0, 1),
            new BlockPosition(1, 1),
            new BlockPosition(2, 1),
        ]),
        new BlockSet([
            new BlockPosition(0, 0),
            new BlockPosition(0, 1),
            new BlockPosition(0, 2),
            new BlockPosition(1, 1),
        ]),
    ]);

    public static readonly ALL_PIECES: Tetromino[] = [
        Tetromino.I_PIECE,
        Tetromino.J_PIECE,
        Tetromino.L_PIECE,
        Tetromino.O_PIECE,
        Tetromino.S_PIECE, 
        Tetromino.T_PIECE,
        Tetromino.Z_PIECE];

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

    public numPossibleRotations(): number {
        return this.blockSet.length;
    }

}

/*
For displaying the next piece in the next box. only stores the default rotation, and translations
are for half-mino increments to center the piece
// X is between 0 and 3, Y is between 0 and 1 inclusive
*/
export class TetrominoNB {

    public static readonly I_NB: TetrominoNB = new TetrominoNB(TetrominoType.I_TYPE, new BlockSet([
        new BlockPosition(0, 0.5),
        new BlockPosition(1, 0.5),
        new BlockPosition(2, 0.5),
        new BlockPosition(3, 0.5)
    ]));

    public static readonly T_NB: TetrominoNB = new TetrominoNB(TetrominoType.T_TYPE, new BlockSet([
        new BlockPosition(0.5, 0),
        new BlockPosition(1.5, 0),
        new BlockPosition(2.5, 0),
        new BlockPosition(1.5, 1)
    ]));

    public static readonly J_NB: TetrominoNB = new TetrominoNB(TetrominoType.J_TYPE, new BlockSet([
        new BlockPosition(0.5, 0),
        new BlockPosition(1.5, 0),
        new BlockPosition(2.5, 0),
        new BlockPosition(2.5, 1)
    ]));

    public static readonly L_NB: TetrominoNB = new TetrominoNB(TetrominoType.L_TYPE, new BlockSet([
        new BlockPosition(0.5, 0),
        new BlockPosition(1.5, 0),
        new BlockPosition(2.5, 0),
        new BlockPosition(0.5, 1)
    ]));

    public static readonly O_NB: TetrominoNB = new TetrominoNB(TetrominoType.O_TYPE, new BlockSet([
        new BlockPosition(1, 0),
        new BlockPosition(2, 0),
        new BlockPosition(1, 1),
        new BlockPosition(2, 1)
    ]));

    public static readonly S_NB: TetrominoNB = new TetrominoNB(TetrominoType.S_TYPE, new BlockSet([
        new BlockPosition(0.5, 1),
        new BlockPosition(1.5, 1),
        new BlockPosition(1.5, 0),
        new BlockPosition(2.5, 0)
    ]));

    public static readonly Z_NB: TetrominoNB = new TetrominoNB(TetrominoType.Z_TYPE, new BlockSet([
        new BlockPosition(0.5, 0),
        new BlockPosition(1.5, 0),
        new BlockPosition(1.5, 1),
        new BlockPosition(2.5, 1)
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

export class TetronimoOCR {
    constructor(public readonly type: TetrominoType, public readonly grid: BinaryGrid) {
        if (grid.numRows !== 6 || grid.numCols !== 8) {
            throw new Error('TetronimoOCR grid must be 6x8');
        }
    }

    public static readonly I_OCR: TetronimoOCR = new TetronimoOCR(TetrominoType.I_TYPE, new BinaryGrid([
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1 ,1, 1, 1, 1, 1],
        [1, 1, 1 ,1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ]));

    public static readonly T_OCR: TetronimoOCR = new TetronimoOCR(TetrominoType.T_TYPE, new BinaryGrid([
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1 ,1, 1, 1, 1, 1, 0],
        [0, 1 ,1, 1, 1, 1, 1, 0],
        [0, 0 ,0, 1, 1, 0, 0, 0],
        [0, 0 ,0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ]));

    public static readonly L_OCR: TetronimoOCR = new TetronimoOCR(TetrominoType.L_TYPE, new BinaryGrid([
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1 ,1, 1, 1, 1, 1, 0],
        [0, 1 ,1, 1, 1, 1, 1, 0],
        [0, 1 ,1, 0, 0, 0, 0, 0],
        [0, 1 ,1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ]));

    public static readonly J_OCR: TetronimoOCR = new TetronimoOCR(TetrominoType.J_TYPE, new BinaryGrid([
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1 ,1, 1, 1, 1, 1, 0],
        [0, 1 ,1, 1, 1, 1, 1, 0],
        [0, 0 ,0, 0, 0, 1, 1, 0],
        [0, 0 ,0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ]));

    public static readonly O_OCR: TetronimoOCR = new TetronimoOCR(TetrominoType.O_TYPE, new BinaryGrid([
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0 ,1, 1, 1, 1, 0, 0],
        [0, 0 ,1, 1, 1, 1, 0, 0],
        [0, 0 ,1, 1, 1, 1, 0, 0],
        [0, 0 ,1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ]));

    public static readonly S_OCR: TetronimoOCR = new TetronimoOCR(TetrominoType.S_TYPE, new BinaryGrid([
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0 ,0, 1, 1, 1, 1, 0],
        [0, 0 ,0, 1, 1, 1, 1, 0],
        [0, 1 ,1, 1, 1, 0, 0, 0],
        [0, 1 ,1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ]));

    public static readonly Z_OCR: TetronimoOCR = new TetronimoOCR(TetrominoType.Z_TYPE, new BinaryGrid([
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1 ,1, 1, 1, 0, 0, 0],
        [0, 1 ,1, 1, 1, 0, 0, 0],
        [0, 0 ,0, 1, 1, 1, 1, 0],
        [0, 0 ,0, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ]));

    public static readonly ALL_OCR: TetronimoOCR[] = [
        TetronimoOCR.I_OCR,
        TetronimoOCR.T_OCR,
        TetronimoOCR.J_OCR,
        TetronimoOCR.L_OCR,
        TetronimoOCR.O_OCR,
        TetronimoOCR.S_OCR,
        TetronimoOCR.Z_OCR
    ];

    public static getOCRByType(type: TetrominoType): TetronimoOCR {
        return TetronimoOCR.ALL_OCR.find(piece => piece.type === type)!;
    }

    // return number of blocks that are different. the lower, the more similar
    public similarityTo(otherGrid: BinaryGrid): number {
        let diff = 0;
        for (let y = 0; y < this.grid.numRows; y++) {
            for (let x = 0; x < this.grid.numCols; x++) {
                if (this.grid.at(x, y) !== otherGrid.at(x, y)) {
                    diff++;
                }
            }
        }
        return diff;
    }

    // classify next box piece type based on OCR grid. If no piece is sufficiently similar, return undefined
    public static findMostSimilarPieceType(grid: BinaryGrid): TetrominoType | undefined {

        const MAXIMUM_DIFFERENCE_ALLOWED = 2;

        let lowestDiff = undefined;
        let lowestDiffType;
        for (const tetromino of TetronimoOCR.ALL_OCR) {
            const diff = tetromino.similarityTo(grid);
            if (lowestDiff === undefined || diff < lowestDiff) {
                lowestDiff = diff;
                lowestDiffType = tetromino.type;
            }
        }

        if (lowestDiff === undefined || lowestDiff > MAXIMUM_DIFFERENCE_ALLOWED) {
            return undefined;
        } else {
            return lowestDiffType;
        }



    }

}