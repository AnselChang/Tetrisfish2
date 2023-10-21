/*
Represents the x/y position of a block in the grid. Can either represent a relative or absolute
position. Can check if in bounds, which is useful for absolute positions only

X starts at 1 on the left, and increases to the right to 10
Y starts at 1 on the bottom, and increases to the top to 20

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