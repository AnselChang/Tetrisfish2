/*
Represents the 10x20 grid of blocks.
Binary because it only stores whether a block is filled or not, not any other information.
grid[y][x]
*/

import { compressGridStringToBase64, decompressBase64ToGridString } from "shared/scripts/compress-grid";

export enum BlockType {
    EMPTY = 0,
    FILLED = 1
}

export interface Grid {
    get numRows(): number;
    get numCols(): number;
    exists(x: number, y: number): boolean;

}

export default class BinaryGrid implements Grid {

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

    public exists(x: number, y: number): boolean {
        if (x < 0 || x >= this.numCols) return false;
        if (y < 0 || y >= this.numRows) return false;
        return this.at(x, y) === BlockType.FILLED;
    }

    // returns how many minos exist in the grid
    public count(): number {
        return this.blocks.reduce((acc, row) =>
            acc + row.reduce((rowAcc, block) =>
                rowAcc + (block === BlockType.FILLED ? 1 : 0), 0), 0);
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

    public isRowFull(y: number): boolean {
        return this.blocks[y].every(block => block === BlockType.FILLED);
    }

    // modifies grid in place to delete line clears
    public processLineClears() {
        // remove all full rows
        let y = this.numRows - 1;
        let numLinesCleared = 0;
        while (y >= 0) {
            if (this.isRowFull(y)) {
                this.blocks.splice(y, 1);
                numLinesCleared++;
            }
            y--;
        }

        // insert new empty rows at the top
        for (let i = 0; i < numLinesCleared; i++) {
            this.blocks.unshift(new Array(this.numCols).fill(BlockType.EMPTY));
        }
    }

    // given a string consisting of 200 0s and 1s, make the grid
    public _setFromString(grid: string) {
        this.blocks = [];
        let i = 0;
        for (let row = 0; row < 20; row++) {
            this.blocks.push([]);
            for (let col = 0; col < 10; col++) {
                const fill = (grid[i] === '1') ? BlockType.FILLED : BlockType.EMPTY;
                this.blocks[this.blocks.length-1].push(fill);
                i++;
            }
        }
    }

    public _setFromCompressedString(grid: string) {
        this._setFromString(decompressBase64ToGridString(grid));
    }

    public static fromString(grid: string): BinaryGrid {
        const newGrid = new BinaryGrid();
        newGrid._setFromString(grid);
        return newGrid;
    }

    public _getAsString(): string {
        let result = "";
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                result += this.blocks[row][col] === BlockType.FILLED ? "1" : "0";
            }
        }
        return result;
    }

    public _getAsCompressedString(): string {
        return compressGridStringToBase64(this._getAsString());
    }

    // grid1 - grid2
    // returns undefined if invalid operation
    // returns a new BinaryGrid object, does not modify grid1 or grid2
    public static subtract(grid1: BinaryGrid, grid2: BinaryGrid): BinaryGrid | undefined {

            if (grid1.numRows !== grid2.numRows || grid1.numCols !== grid2.numCols) {
                return undefined;
            }

            const newGrid = grid1.copy();
            for (let i = 0; i < grid1.numRows; i++) {
                for (let j = 0; j < grid1.numCols; j++) {
                    if (grid2.at(j, i) === BlockType.FILLED) {
                        if (newGrid.at(j, i) === BlockType.EMPTY) {
                            return undefined;
                        } else {
                            newGrid.setAt(j, i, BlockType.EMPTY);
                        }
                    }
                }
            }

            return newGrid;
        }


    public print(): void {
        console.log(this.blocks.map(row => row.map(block => block === BlockType.FILLED ? 'X' : '.').join('')).join('\n'));
    }

}
