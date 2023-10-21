/*
A class defining the relative positions of a set of blocks. Can apply translations (not rotations)
to the set, and map to an absolute position on the board.

Does not represent anything like the piece type or color of the blocks. See Tetromino for that.

Objects are immutable. Transformations return new objects
*/

import { BlockPosition } from "./block-position";

export class BlockSet {

    constructor(public readonly blocks: BlockPosition[]) {}

    // Returns a new BlockSet with the blocks translated by the given amount
    translate(x: number, y: number): BlockSet {
        return new BlockSet(this.blocks.map(block => block.translate(x, y)));
    }

}