/*
Represents all the state for a frame after OCR
*/

import GameStatus from "../tetronimo-models/game-status";
import { TetrominoType, TetronimoOCR } from "../tetronimo-models/tetromino";
import BinaryGrid from "../tetronimo-models/binary-grid";
import ColorGrid from "../tetronimo-models/color-grid";


export class ExtractedState {

    // if no capture, then all fields are set to default values
    private status: GameStatus = new GameStatus(0, 0, 0);
    private grid: BinaryGrid = new BinaryGrid();
    private colorGrid: ColorGrid = new ColorGrid();
    private nextPieceType?: TetrominoType = undefined;

    private levelConfidence: string = "";
    private linesConfidence: string = "";

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

    public getColorGrid(): ColorGrid {
        return this.colorGrid;
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

    public setColorGrid(colorGrid: ColorGrid): void {
        this.colorGrid = colorGrid;
    }

    public setNext(nextGrid: BinaryGrid): void {
        if (nextGrid === undefined) this.nextPieceType = undefined;
        else this.nextPieceType = TetronimoOCR.findMostSimilarPieceType(nextGrid);

    }

    public setLevel(level: number, confidence: string): void {
        this.status.level = level;
        this.levelConfidence = confidence;
    }

    public setLines(lines: number, confidence: string): void {
        this.status.lines = lines;
        this.linesConfidence = confidence;
    }

    public getLevelConfidence(): string {
        return this.levelConfidence;
    }

    public getLinesConfidence(): string {
        return this.linesConfidence;
    }

    public setPaused(isPaused: boolean): void {
        this.isPaused = isPaused;
    }
}