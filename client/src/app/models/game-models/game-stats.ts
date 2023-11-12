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

    public onLineClears(linesBurned: number): void {
        this.linesBurned += linesBurned;
        if (linesBurned === 4) {
            this.numTetrises++;
        }
    }

    public getLinesBurned(): number {
        return this.linesBurned;
    }

    public getTetrisRate(): number {
        if (this.linesBurned === 0) return 0;
        return this.numTetrises * 4 / this.linesBurned;
    }

    public trackTransitionLevel(level: number): void {
        this.transitionScores.push(new TransitionScore(level, undefined));
    }

    public getTransitionScores(): TransitionScore[] {
        return this.transitionScores;
    }

}