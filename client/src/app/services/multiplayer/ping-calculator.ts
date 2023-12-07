// keeps a dictionary of ping send times
export class PingCalculator {

    private currentPingID = 0;
    private pingSendTimes: { [pingID: number]: Date } = {};

    private mostRecentPingDuration?: number;
    
    constructor() {}

    // registers a ping send time and returns the pingID
    public sendPing(): number {
        this.currentPingID++;
        this.pingSendTimes[this.currentPingID] = new Date();
        return this.currentPingID;
    }

    public receivePong(pingID: number): void {
        const sendTime = this.pingSendTimes[pingID];
        if (sendTime === undefined) {
            console.error("Received pong for pingID that was not sent");
            return;
        }
        const duration = Date.now() - sendTime.getTime();
        this.mostRecentPingDuration = duration;

        delete this.pingSendTimes[pingID];
    }

    // return the most recent ping duration in milliseconds
    public getPing(): number | undefined {
        return this.mostRecentPingDuration;
    }



}