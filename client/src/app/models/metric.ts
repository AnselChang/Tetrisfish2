// Computes running best/worst/average/median of a metric somewhat efficiently
export class Metric {
    private best?: number;
    private worst?: number;

    private sum = 0;
    private values: number[] = [];

    public push(value: number) {
        if (this.best === undefined) {
            this.best = value;
            return;
        }

        if (this.worst === undefined) {
            this.worst = value;
        }

        this.best = Math.max(this.best, value);
        this.worst = Math.min(this.worst, value);
        this.sum += value;
        this.values.push(value);

        this.values.sort((a, b) => a - b);
    }

    public hasValues(): boolean {
        return this.values.length > 0;
    }

    public getWorst(): number | undefined {
        return this.worst;
    }

    public getBest(): number | undefined {
        return this.best;
    }

    public getAverage(): number | undefined {
        if (this.values.length === 0) return undefined;
        return this.sum / this.values.length;
    }

    public getMedian(): number | undefined {
        if (this.values.length === 0) return undefined;
        return this.values[Math.floor(this.values.length / 2)];
    }
}