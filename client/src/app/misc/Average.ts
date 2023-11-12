// compute rolling average

export class Average {
    private numValues: number = 0;
    private sum: number = 0;

    public push(value: number): void {
        this.numValues++;
        this.sum += value;
    }

    public getAverage(): number {
        if (this.numValues === 0) return 0;
        return this.sum / this.numValues;
    }

    public getSum(): number {
        if (this.numValues === 0) return Number.NEGATIVE_INFINITY;
        return this.sum;
    }

    public hasValues(): boolean {
        return this.numValues > 0;
    }

}