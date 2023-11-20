import { InputSpeed } from "../../scripts/evaluation/input-frame-timeline";
import { LeaderboardType } from "../leaderboard-models/leaderboards";

export default class GameEligibility {

    private readonly MAX_PIECES_OVER_HZ_ALLOWED: number = 3;

    private numPiecesOverHz: number = 0;
    private hasPaused: boolean = false;
    private locked: boolean = false;

    constructor(public readonly startLevel: number, public readonly inputSpeed: InputSpeed) {}

    public onPieceOverHz(): void {
        if (this.locked) return;
        this.numPiecesOverHz++;
    }

    public onPiecePause(): void {
        if (this.locked) return;
        this.hasPaused = true;
    }

    public getNumPiecesOverHz(): number {
        return this.numPiecesOverHz;
    }

    public getNumPiecesOverHzAllowed(): number {
        return this.MAX_PIECES_OVER_HZ_ALLOWED;
    }

    public isNumPiecesOverHzAllowed(): boolean {
        if (this.inputSpeed === InputSpeed.HZ_30) return true;
        return this.numPiecesOverHz <= this.MAX_PIECES_OVER_HZ_ALLOWED;
    }

    public getHasPaused(): boolean {
        return this.hasPaused;
    }

    public getStartLevel(): number {
        return this.startLevel;
    }

    public isStartLevelAllowed(): boolean {
        return this.startLevel === 18 || this.startLevel === 19 || this.startLevel === 29;
    }

    // return overall, 29, or undefined if not eligible
    public getEligibility(): LeaderboardType | undefined {
        if (this.hasPaused) return undefined;
        if (this.numPiecesOverHz > this.MAX_PIECES_OVER_HZ_ALLOWED) return undefined;
        if (!this.isStartLevelAllowed()) return undefined;

        if (this.startLevel === 29) return LeaderboardType.TWENTY_NINE;
        else return LeaderboardType.OVERALL;
    }

    // cannot change eligibility once locked
    public lockEligibility(): void {
        this.locked = true;
    }

}