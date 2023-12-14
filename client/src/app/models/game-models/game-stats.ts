import BinaryGrid from "../tetronimo-models/binary-grid";
import { IGameStatus } from "../tetronimo-models/game-status";
import { TetrominoType } from "../tetronimo-models/tetromino";
import { BasePlacement } from "./base-placement";
import { GamePlacement } from "./game-placement";

// transition TO this level
export class TransitionScore {
    constructor(
        public readonly level: number,
        public score: number | undefined,
    ) {}
}

export class Subscore {

    private totalPositions = 0;

    public readonly droughtStats: DroughtStats = new DroughtStats();
    public readonly lineClearStats: LineClearStats = new LineClearStats();
    public readonly efficiencyStats: EfficiencyStats = new EfficiencyStats();
    public readonly tetrisReadinessStats: TetrisReadinessStats = new TetrisReadinessStats();
    public readonly rightWellOpenStats: RightWellOpenStats = new RightWellOpenStats();

    constructor(
        public readonly level: number,
        private score: number = 0,
    ) {}

    public onPlacement(placement: BasePlacement, linesBurned: number, statusBeforePlacement: IGameStatus, statusAfterPlacement: IGameStatus): void {
        const diff = statusAfterPlacement.score - statusBeforePlacement.score;
        const currentType = placement.getMTPlacement().tetrominoType;
        
        this.droughtStats.updateDroughtCount(currentType);
        this.lineClearStats.updateBurnedLinesAndTetrises(linesBurned);
        this.efficiencyStats.updateIPieceEfficiency(currentType, linesBurned);
        this.tetrisReadinessStats.updateTetrisReadiness(placement.getBoard());
        this.rightWellOpenStats.updateRightWellOpen(placement.getBoard());

        this.score += diff;
        this.totalPositions++;
    }

    public getScore(): number {
        return this.score;
    }

    public getNumPositions(): number {
        return this.totalPositions;
    }

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
    private subscores: Subscore[] = [];

    private readonly droughtStats: DroughtStats = new DroughtStats();
    private readonly lineClearStats: LineClearStats = new LineClearStats();
    private readonly efficiencyStats: EfficiencyStats = new EfficiencyStats();
    private readonly tetrisReadinessStats: TetrisReadinessStats = new TetrisReadinessStats();
    private readonly rightWellOpenStats: RightWellOpenStats = new RightWellOpenStats();

    private numPlacements: number = 0;

    constructor(transitionLevelsToTrack: number[], subscoresToTrack: number[] = []) {
        transitionLevelsToTrack.forEach(level => {
            this.transitionScores.push(new TransitionScore(level, undefined));
        });

        subscoresToTrack.forEach(level => {
            this.subscores.push(new Subscore(level));
        });
    }

    private calculateTransitionScores(statusAfterPlacement: IGameStatus): void {
        for (let transition of this.getTransitionScores()) {
            if (statusAfterPlacement.level === transition.level && transition.score === undefined) {
                // on transition
                transition.score = statusAfterPlacement.score;
            }
        }
    }

    private updateSubscores(placement: BasePlacement, linesBurned: number, statusBeforePlacement: IGameStatus, statusAfterPlacement: IGameStatus): void {


        let matchingSubscore: Subscore | undefined = undefined;
        for (let subscore of this.subscores) {
            if (statusBeforePlacement.level >= subscore.level) {
                matchingSubscore = subscore;
            }
        }

        if (matchingSubscore === undefined) return;

        matchingSubscore.onPlacement(placement, linesBurned, statusBeforePlacement, statusAfterPlacement);
    }

    public onPiecePlacement(placement: BasePlacement, linesBurned: number, statusBeforePlacement: IGameStatus, statusAfterPlacement: IGameStatus): void {
        const currentType = placement.getMTPlacement().tetrominoType;

        this.droughtStats.updateDroughtCount(currentType);
        this.lineClearStats.updateBurnedLinesAndTetrises(linesBurned);
        this.efficiencyStats.updateIPieceEfficiency(currentType, linesBurned);
        this.tetrisReadinessStats.updateTetrisReadiness(placement.getBoard());
        this.rightWellOpenStats.updateRightWellOpen(placement.getBoard());

        this.calculateTransitionScores(statusAfterPlacement);
        this.updateSubscores(placement ,linesBurned, statusBeforePlacement, statusAfterPlacement);

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

    public getSubscore(level: number): Subscore | undefined {
        return this.subscores.find(subscore => subscore.level === level);
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