import { Grid } from "./binary-grid";
import { TetrominoColorType } from "./tetromino";

// Stores an RGB color grid
export default class ColorGrid implements Grid {

    constructor(public blocks: TetrominoColorType[][] = [], numRows: number = 20, numCols: number = 10) {

        // If no blocks are provided, create an empty grid of width x height of all white
        if (blocks.length === 0) {
            for (let i = 0; i < numRows; i++) {
                blocks.push([]);
                for (let j = 0; j < numCols; j++) {
                    blocks[i].push(TetrominoColorType.COLOR_WHITE);
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

    public setAt(x: number, y: number, color: TetrominoColorType) {
        this.blocks[y][x] = color;
    }

    public at(x: number, y: number): TetrominoColorType {
        return this.blocks[y][x];
    }

    public exists(x: number, y: number): boolean {
        if (x < 0 || x >= this.numCols) return false;
        if (y < 0 || y >= this.numRows) return false;
        return true;
    }

    private colorToString(color: TetrominoColorType): string {
        if (color === TetrominoColorType.COLOR_WHITE) return "0";
        else if (color === TetrominoColorType.COLOR_FIRST) return "1";
        else return "2";
    }

    public toString(): string {
        // print as a matrix
        let result = "";
        for (let y = 0; y < this.numRows; y++) {
            for (let x = 0; x < this.numCols; x++) {
                result += this.colorToString(this.at(x, y)) + " ";
            }
            result += "\n";
        }
        return result;
    }
}