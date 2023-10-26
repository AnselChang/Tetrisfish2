/*
Represents the 10x20 grid of blocks. 
Binary because it only stores whether a block is filled or not, not any other information.
*/

export enum BlockType {
    EMPTY,
    FILLED
}

export default class BinaryGrid {

    constructor(public blocks: BlockType[][] = []) {

        // If no blocks are provided, create an empty grid
        if (blocks.length === 0) {
            for (let i = 0; i < 20; i++) {
                blocks.push([]);
                for (let j = 0; j < 10; j++) {
                    blocks[i].push(BlockType.EMPTY);
                }
            }
        }

        if (blocks.length !== 20) {
            throw new Error('Grid must have 20 rows');
        }
        if (blocks[0].length !== 10) {
            throw new Error('Grid must have 10 columns');
        }
    }

    public setAt(x: number, y: number, blockType: BlockType) {
            
            if (x < 1 || x > 10) {
                throw new Error('x must be between 1 and 10');
            }
    
            if (y < 1 || y > 20) {
                throw new Error('y must be between 1 and 20');
            }
    
            this.blocks[y - 1][x - 1] = blockType;
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

    public copy(): BinaryGrid {

        const newBlocks: BlockType[][] = [];
        for (let i = 0; i < 20; i++) {
            newBlocks.push([]);
            for (let j = 0; j < 10; j++) {
                newBlocks[i].push(this.blocks[i][j]);
            }
        }

        return new BinaryGrid(newBlocks);
    }

}
