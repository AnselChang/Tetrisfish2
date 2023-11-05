/*
Represents the 10x20 grid of blocks. 
Binary because it only stores whether a block is filled or not, not any other information.
grid[y][x]
*/

export enum BlockType {
    EMPTY = 0,
    FILLED = 1
}

export default class BinaryGrid {

    constructor(public blocks: BlockType[][] = [], numRows: number = 20, numCols: number = 10) {

        // If no blocks are provided, create an empty grid of width x height
        if (blocks.length === 0) {
            for (let i = 0; i < numRows; i++) {
                blocks.push([]);
                for (let j = 0; j < numCols; j++) {
                    blocks[i].push(BlockType.EMPTY);
                }
            }
        }
    }

    public get numRows(): number {
        return this.blocks.length;
    }

    public get numCols(): number {
        return this.blocks[0].length;
    }

    public setAt(x: number, y: number, blockType: BlockType) {
        this.blocks[y][x] = blockType;
    }

    public at(x: number, y: number): BlockType {
        return this.blocks[y][x];
    }

    public copy(): BinaryGrid {

        const newBlocks: BlockType[][] = [];
        for (let i = 0; i < this.blocks.length; i++) {
            newBlocks.push([]);
            for (let j = 0; j < this.blocks[i].length; j++) {
                newBlocks[i].push(this.blocks[i][j]);
            }
        }

        return new BinaryGrid(newBlocks);
    }

}
