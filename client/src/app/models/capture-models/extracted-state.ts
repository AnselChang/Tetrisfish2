/*
Represents all the state for a frame after OCR
*/

import GameStatus from "../tetronimo-models/game-status";
import { TetrominoType, TetronimoOCR } from "../tetronimo-models/tetromino";
import BinaryGrid from "../tetronimo-models/binary-grid";


export class ExtractedState {

    // if no capture, then all fields are set to default values
    private status: GameStatus = new GameStatus(0, 0, 0);
    private grid: BinaryGrid = new BinaryGrid();
    private nextPieceType?: TetrominoType = undefined;

    private isPaused: boolean = false;
    
    constructor(
        status?: GameStatus,
        grid?: BinaryGrid,
        nextPieceType?: TetrominoType
    ) {
        if (status) {
            this.status = status;
        }
        if (grid) {
            this.grid = grid;
        }
        if (nextPieceType) {
            this.nextPieceType = nextPieceType;
        }
    }

    public getStatus(): GameStatus {
        return this.status;
    }

    public getGrid(): BinaryGrid {
        return this.grid;
    }

    public getNextPieceType(): TetrominoType | undefined {
        return this.nextPieceType;
    }

    public getPaused(): boolean {
        return this.isPaused;
    }

    public setGrid(grid: BinaryGrid): void {
        this.grid = grid;
    }

    public setNext(nextGrid: BinaryGrid): void {
        if (nextGrid === undefined) this.nextPieceType = undefined;
        else this.nextPieceType = TetronimoOCR.findMostSimilarPieceType(nextGrid);

        console.log("next piece type: " + this.nextPieceType);
    }

    public setLevel(levelGrid: BinaryGrid): void {
        this.status.level = 0; // TODO
    }

    public setLines(linesGrid: BinaryGrid): void {
        this.status.lines = 0; // TODO
    }

    public setPaused(isPaused: boolean): void {
        this.isPaused = isPaused;
    }
}