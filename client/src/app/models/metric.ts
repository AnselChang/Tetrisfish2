// Computes running best/worst/average/median of a metric somewhat efficiently
export class Metric {
    private best?: number;
    private worst?: number;

    private sum = 0;
    private sortedValues: number[] = []; // sorted in ascending order for fast median calculation
    private orderedValues: (number | undefined)[] = []; // retain push order

    // if undefined is pushed, it goes into orderedValues but ignored for all other metrics
    public push(value: number | undefined) {

        if (value === undefined) {
            this.orderedValues.push(value);
            return;
        }

        if (this.best === undefined) {
            this.best = value;
        }

        if (this.worst === undefined) {
            this.worst = value;
        }

        this.best = Math.max(this.best, value);
        this.worst = Math.min(this.worst, value);
        this.sum += value;
        this.sortedValues.push(value);
        this.orderedValues.push(value);

        this.sortedValues.sort((a, b) => a - b);
    }

    public hasValues(): boolean {
        return this.sortedValues.length > 0;
    }

    // get values ordered as originally pushed
    public getValues(): (number | undefined)[] {
        return this.orderedValues;
    }

    
    public getWorst(): number | undefined {
        return this.worst;
    }

    public getBest(): number | undefined {
        return this.best;
    }

    public getAverage(): number | undefined {
        if (this.sortedValues.length === 0) return undefined;
        return this.sum / this.sortedValues.length;
    }

    public getMedian(): number | undefined {
        if (this.sortedValues.length === 0) return undefined;

        // if even, take average of middle two
        if (this.sortedValues.length % 2 === 0) {
            return (this.sortedValues[this.sortedValues.length / 2 - 1] + this.sortedValues[this.sortedValues.length / 2]) / 2;
        }
        else { // if odd, take middle
            return this.sortedValues[Math.floor(this.sortedValues.length / 2)];
        }

    }
}