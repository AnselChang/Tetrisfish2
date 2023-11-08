/*
A tetromino set to some absolute position and rotation on the board. Mutable, so can be translated around.
Exposes utility methods for checking if the tetromino is in bounds, and if it is colliding with
other blocks.
*/

import BinaryGrid, { BlockType } from "../tetronimo-models/binary-grid";
import { BlockSet } from "../tetronimo-models/block";
import { Tetromino, TetrominoType } from "../tetronimo-models/tetromino";


export default class MoveableTetromino {

    private currentBlockSet!: BlockSet;

    constructor(public readonly tetrominoType: TetrominoType, private rotation: number, private translateX: number, private translateY: number) {
        this.updateCurrentBlockSet()
    }

    // given grids without and with the piece, return a MoveableTetromino that represents the piece if found,
    // or undefined if not found
    static computeMoveableTetronimo(gridWithoutPiece: BinaryGrid, gridWithPiece: BinaryGrid): MoveableTetromino | undefined {
        return new MoveableTetromino(TetrominoType.I_TYPE, 0, 0, 0); // DUMMY CODE
    }

    private updateCurrentBlockSet(): void {
        const tetromino = Tetromino.getPieceByType(this.tetrominoType);
        this.currentBlockSet = tetromino.getBlockSet(this.rotation).translate(this.translateX, this.translateY);
    }

    public getCurrentBlockSet(): BlockSet {
        return this.currentBlockSet;
    }

    public updatePose(rotation: number | undefined, translateX: number | undefined, translateY: number | undefined): void {
        if (rotation !== undefined) {
            this.rotation = rotation;
        }
        if (translateX !== undefined) {
            this.translateX = translateX;
        }
        if (translateY !== undefined) {
            this.translateY = translateY;
        }
        this.updateCurrentBlockSet();
    }


    // Returns true if the tetromino is in bounds of the grid
    public inBounds(): boolean {
        return this.getCurrentBlockSet().blocks.every(block => block.inBounds());
    }

    // Whether one of the minos of this tetromino is a the given position
    public isAtLocation(x: number, y: number): boolean {
        return this.getCurrentBlockSet().blocks.some(block => block.x === x && block.y === y);
    }

    // whether the minos of this tetromino are colliding with the grid
    public collidesWithGrid(grid: BinaryGrid): boolean {

        if (!this.inBounds()) return true;

        return this.getCurrentBlockSet().blocks.some(block => grid.at(block.x, block.y) === BlockType.FILLED);
    }

    public blitToGrid(grid: BinaryGrid): BinaryGrid {
        
        if (this.collidesWithGrid(grid)) {
            throw new Error('Cannot blit to grid if colliding with grid');
        }

        const blockSet = this.getCurrentBlockSet();
        return new BinaryGrid(grid.blocks.map((row, y) => {
            return row.map((block, x) => {
                return block === BlockType.FILLED || blockSet.blocks.some(block => block.x === x + 1 && block.y === y + 1) ? BlockType.FILLED : BlockType.EMPTY;
            });
        }));
    }
}
