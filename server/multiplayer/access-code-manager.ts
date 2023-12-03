/*
Handles creation and conversion of six-digit access codes to slot IDs
Ensure that access codes are unique
*/

import { Room } from "./room";

export class AccessCodeManager {
    
     // map 6-digit access codes to each slot for every room
    private accessCodes: Map<number, string> = new Map();

    constructor() {

    }

    // get the slot ID from an access code
    public getSlotID(accessCode: number): string | undefined {
        return this.accessCodes.get(accessCode);
    }

    // generate a new 6-digit access code that is not already in use
    private generateAccessCode(): number {
        let accessCode: number;
        do {
            accessCode = Math.floor(Math.random() * 1000000);
        } while (this.accessCodes.has(accessCode));
        return accessCode;
    }

    // generate a new access code for a slot
    onSlotCreated(slotID: string): number {
        const accessCode = this.generateAccessCode();
        this.accessCodes.set(accessCode, slotID);
        return accessCode;
    }

    // remove an access code from the map
    onSlotRemoved(slotID: string): void {
        this.accessCodes.forEach((value, key) => {
            if (value === slotID) {
                this.accessCodes.delete(key);
            }
        });
    }

    onRoomDestroyed(room: Room): void {
        room.getSlots().forEach(slot => this.onSlotRemoved(slot.slotID));
    }

}