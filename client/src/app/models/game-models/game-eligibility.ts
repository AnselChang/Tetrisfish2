import { InputSpeed } from "../../scripts/evaluation/input-frame-timeline";
import { LeaderboardType } from "../leaderboard-models/leaderboards";

export default class GameEligibility {

    private hasPaused: boolean = false;
    private locked: boolean = false;

    constructor(public readonly startLevel: number, public readonly inputSpeed: InputSpeed) {
    }

    public onPiecePause(): void {
        if (this.locked) return;
        this.hasPaused = true;
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

    public getIs30Hz(): boolean {
        return this.inputSpeed === InputSpeed.HZ_30;
    }

    // return overall, 29, or undefined if not eligible
    public getEligibility(): LeaderboardType | undefined {
        if (this.hasPaused) return undefined;
        if (!this.getIs30Hz()) return undefined;
        if (!this.isStartLevelAllowed()) return undefined;

        if (this.startLevel === 29) return LeaderboardType.TWENTY_NINE;
        else return LeaderboardType.OVERALL;
    }

    // cannot change eligibility once locked
    public lockEligibility(): void {
        this.locked = true;
    }

}