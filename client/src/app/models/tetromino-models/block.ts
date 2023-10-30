/*
Represents the x/y position of a block in the grid. Can either represent a relative or absolute
position. Can check if in bounds, which is useful for absolute positions only

X starts at 1 on the left, and increases to the right to 10
Y starts at 1 on the top, and increases to the bottom to 20

Objects are immutable. Transformations return new objects

*/
export class BlockPosition {
    constructor(public readonly x: number, public readonly y: number) {}

    // Returns a new BlockPosition with the x/y values translated by the given amount
    translate(x: number, y: number): BlockPosition {
        return new BlockPosition(this.x + x, this.y + y);
    }

    // Returns true if the block is in bounds of the grid
    inBounds(): boolean {
        return this.x >= 1 && this.x <= 10 && this.y >= 1 && this.y <= 20;
    }
}

/*
A class defining the relative positions of a set of blocks. Can apply translations (not rotations)
to the set, and map to an absolute position on the board.

Does not represent anything like the piece type or color of the blocks. See Tetromino for that.

Objects are immutable. Transformations return new objects
*/
export class BlockSet {

    constructor(public readonly blocks: BlockPosition[]) {}

    // Returns a new BlockSet with the blocks translated by the given amount
    translate(x: number, y: number): BlockSet {
        return new BlockSet(this.blocks.map(block => block.translate(x, y)));
    }

    // return whether a given position exists in the block set
    contains(x: number, y: number): boolean {
        return this.blocks.some(block => block.x === x && block.y === y);
    }


}