export class GameStats {
    private linesBurned: number = 0;
    private numTetrises: number = 0;

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

}