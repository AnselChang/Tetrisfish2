/**
 * FpsTracker class for tracking the frames per second (FPS) in a real-time application.
 * This class provides a way to measure the rate at which a certain operation (or 'tick') is performed.
 * 
 * Methods:
 *   tick(): Called at each operation or 'tick'. This method records the current time of each tick.
 *   getFPS(): Calculates and returns the average number of ticks per second over the last second.
 **/

import { RollingAverage } from "../scripts/rolling-average";

export class FpsTracker {
    private timestamps: number[];
    private averageFPS = new RollingAverage(20);
    private averageTickBusyDuration = new RollingAverage(20);

    private lastTick = Date.now();

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

        const fps = this.timestamps.length;
        this.averageFPS.push(fps);

        this.lastTick = now;
    }

    endTick(): void {
        const tickBusyDuration = Date.now() - this.lastTick;
        this.averageTickBusyDuration.push(tickBusyDuration);
    }

    getFPS(): number {
        return this.averageFPS.get();
    }

    // returns the average duration of a tick (between tick() and endTick()) in milliseconds
    getTickBusyDuration(): number {
        return this.averageTickBusyDuration.get();
    }
}