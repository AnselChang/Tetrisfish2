/**
 * FpsTracker class for tracking the frames per second (FPS) in a real-time application.
 * This class provides a way to measure the rate at which a certain operation (or 'tick') is performed.
 * 
 * Methods:
 *   tick(): Called at each operation or 'tick'. This method records the current time of each tick.
 *   getFPS(): Calculates and returns the average number of ticks per second over the last second.
 **/

export class FpsTracker {
    private timestamps: number[];

    constructor() {
        this.timestamps = [];
    }

    tick(): void {
        const now = Date.now();
        this.timestamps.push(now);

        // Clean up timestamps older than 1 second
        while (this.timestamps.length > 0 && now - this.timestamps[0] > 1000) {
            this.timestamps.shift();
        }
    }

    getFPS(): number {
        // Calculate FPS based on the number of timestamps in the last second
        return this.timestamps.length;
    }
}