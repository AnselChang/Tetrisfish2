/*
Represents the 10x20 grid of blocks. 
Binary because it only stores whether a block is filled or not, not any other information.

Exposes utility methods for manipulating grid. Grid is immutable, so all manipulative methods return new grids.
*/

export enum BlockType {
    EMPTY,
    FILLED
}

export default class BinaryGrid {

    constructor(public readonly blocks: BlockType[][]) {
        if (blocks.length !== 20) {
            throw new Error('Grid must have 20 rows');
        }
        if (blocks[0].length !== 10) {
            throw new Error('Grid must have 10 columns');
        }
    }

    public at(x: number, y: number): BlockType {

        if (x < 1 || x > 10) {
            throw new Error('x must be between 1 and 10');
        }

        if (y < 1 || y > 20) {
            throw new Error('y must be between 1 and 20');
        }

        return this.blocks[y - 1][x - 1];
    }
}
