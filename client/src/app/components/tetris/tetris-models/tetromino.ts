/*
Represents the seven tetrominoes in the game. Each tetromino has a unique shape and color.
*/

import { BlockSet } from "./block-set";
import { TetrominoType } from "./tetromino-type";

// the four block sets for each rotation of the tetromino.
// 0 = no rotation, 1 = 90 degrees clockwise, 2 = 180 degrees clockwise, 3 = 270 degrees clockwise
export class Tetromino {
    constructor(public readonly type: TetrominoType, public readonly color: string, public readonly blockSet: BlockSet[])
    {}
    
    public getBlockSet(rotation: number): BlockSet {
        return this.blockSet[rotation];
    }
}
