import { TetrominoType } from "../tetronimo-models/tetromino";

// transition TO this level
export class TransitionScore {
    constructor(
        public readonly level: number,
        public score: number | undefined,
    ) {}
}

export class GameStats {
    private linesBurned: number = 0;
    private numTetrises: number = 0;
    private transitionScores: TransitionScore[] = [];
    private droughtCount: number = 0;
    private maxDroughtCount: number = 0;

    // on piece spawn, handle drought count
    public onPieceSpawn(pieceType: TetrominoType): void {
        if (pieceType === TetrominoType.I_TYPE) {
            this.droughtCount = 0;
        }
        else {
            this.droughtCount++;
        }

        this.maxDroughtCount = Math.max(this.maxDroughtCount, this.droughtCount);
    }

    public onLineClears(linesBurned: number): void {
        if (linesBurned === 4) {
            this.numTetrises++;
        } else {
            this.linesBurned += linesBurned;
        }
    }

    public getLinesBurned(): number {
        return this.linesBurned;
    }

    public getTetrisRate(): number {
        if (this.linesBurned === 0) return 0;
        const tetrisLines = this.numTetrises * 4;
        return tetrisLines / (this.linesBurned + tetrisLines);
    }

    public trackTransitionLevel(level: number): void {
        this.transitionScores.push(new TransitionScore(level, undefined));
    }

    public getTransitionScores(): TransitionScore[] {
        return this.transitionScores;
    }

    public getDroughtCount(): number | undefined {
        return (this.droughtCount >= 14) ? this.droughtCount : undefined;
    }

    public getMaxDroughtCount(): number | undefined {
        return (this.maxDroughtCount >= 14) ? this.maxDroughtCount : undefined;
    }

}