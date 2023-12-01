import BinaryGrid from "../tetronimo-models/binary-grid";
import { TetrominoType } from "../tetronimo-models/tetromino";
import { GamePlacement } from "./game-placement";

// transition TO this level
export class TransitionScore {
    constructor(
        public readonly level: number,
        public score: number | undefined,
    ) {}
}

class RightWellOpenStats {
    private numPositionsRightWellOpen: number = 0;

    // the grid without any placement. determine if tetris ready and increment numPositionsTetrisReady if so
    public updateRightWellOpen(grid: BinaryGrid): void {
        if (grid.isRightWellOpen()) {
            this.numPositionsRightWellOpen++;
        }
    }

    public getRightWellOpen(totalPositions: number): number {
        if (totalPositions === 0) return 0;
        return this.numPositionsRightWellOpen / totalPositions;
    }
}

class TetrisReadinessStats {
    private numPositionsTetrisReady: number = 0;

    // the grid without any placement. determine if tetris ready and increment numPositionsTetrisReady if so
    public updateTetrisReadiness(grid: BinaryGrid): void {
        if (grid.isTetrisReady()) {
            this.numPositionsTetrisReady++;
        }
    }

    public getTetrisReadiness(totalPositions: number): number {
        if (totalPositions === 0) return 0;
        return this.numPositionsTetrisReady / totalPositions;
    }
}

// stats for I-piece effiency
class EfficiencyStats {
    private numIPieces: number = 0;
    private numTetrises: number = 0;

    public updateIPieceEfficiency(pieceType: TetrominoType, linesBurned: number): void {
        if (pieceType === TetrominoType.I_TYPE) {
            this.numIPieces++;
            if (linesBurned === 4) this.numTetrises++;
        }
    }

    public getIPieceEfficiency(): number {
        if (this.numIPieces === 0) return 0;
        return this.numTetrises / this.numIPieces;
    }
}

class LineClearStats {
    private linesBurned: number = 0;
    private numTetrises: number = 0;

    public updateBurnedLinesAndTetrises(linesBurned: number): void {
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
}

class DroughtStats {
    private droughtCount: number = 0;
    private timesInDrought: number = 0;

    public updateDroughtCount(pieceType: TetrominoType): void {
        if (pieceType === TetrominoType.I_TYPE) {
            this.droughtCount = 0;
        }
        else {
            this.droughtCount++;
        }

        if (this.isInDrought()) {
            this.timesInDrought++;
        }
    }

    public isInDrought(): boolean {
        return this.droughtCount >= 14;
    }

    public getDroughtCount(): number | undefined {
        return this.isInDrought() ? this.droughtCount : undefined;
    }

    public percentInDrought(totalPositions: number): number {
        if (totalPositions === 0) return 0;
        return this.timesInDrought / totalPositions;
    }

} 

export class GameStats {

    private transitionScores: TransitionScore[] = [];

    private readonly droughtStats: DroughtStats = new DroughtStats();
    private readonly lineClearStats: LineClearStats = new LineClearStats();
    private readonly efficiencyStats: EfficiencyStats = new EfficiencyStats();
    private readonly tetrisReadinessStats: TetrisReadinessStats = new TetrisReadinessStats();
    private readonly rightWellOpenStats: RightWellOpenStats = new RightWellOpenStats();

    private numPlacements: number = 0;

    constructor(transitionLevelsToTrack: number[]) {
        transitionLevelsToTrack.forEach(level => {
            this.transitionScores.push(new TransitionScore(level, undefined));
        });
    }

    public onPiecePlacement(placement: GamePlacement, linesBurned: number): void {
        this.droughtStats.updateDroughtCount(placement.currentPieceType);
        this.lineClearStats.updateBurnedLinesAndTetrises(linesBurned);
        this.efficiencyStats.updateIPieceEfficiency(placement.currentPieceType, linesBurned);
        this.tetrisReadinessStats.updateTetrisReadiness(placement.grid);
        this.rightWellOpenStats.updateRightWellOpen(placement.grid);

        this.numPlacements++;
    }

    public getLinesBurned(): number {
        return this.lineClearStats.getLinesBurned();
    }

    public getTetrisRate(): number {
        return this.lineClearStats.getTetrisRate();
    }

    public getTransitionScores(): TransitionScore[] {
        return this.transitionScores;
    }

    public getDroughtCount(): number | undefined {
        return this.droughtStats.getDroughtCount();
    }

    public getPercentInDrought(): number {
        return this.droughtStats.percentInDrought(this.numPlacements);
    }

    public getIPieceEfficiency(): number {
        return this.efficiencyStats.getIPieceEfficiency();
    }

    public getTetrisReadiness(): number {
        return this.tetrisReadinessStats.getTetrisReadiness(this.numPlacements);
    }

    public getRightWellOpen(): number {
        return this.rightWellOpenStats.getRightWellOpen(this.numPlacements);
    }

    public getScoreAtTransitionTo19(): number | undefined {
        return this.transitionScores.find(ts => ts.level === 19)?.score;
    }

    public getScoreAtTransitionTo29(): number | undefined {
        return this.transitionScores.find(ts => ts.level === 29)?.score;
    }

}