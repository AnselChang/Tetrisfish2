/*
Handles creation and conversion of four-digit access codes to slot IDs
Ensure that access codes are unique
*/

import { Room } from "./room";

const NUM_DIGITS = 4;

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
    private getUniqueAccessCode(): number {
        let accessCode: number;
        do {
            accessCode = Math.floor(Math.random() * Math.pow(10, NUM_DIGITS));
        } while (this.accessCodes.has(accessCode));
        return accessCode;
    }

    // generate a new access code for a slot
    generateAccessCode(slotID: string): number {
        const accessCode = this.getUniqueAccessCode();
        this.accessCodes.set(accessCode, slotID);
        console.log(`Generated access code ${accessCode} for slot ${slotID}`);
        return accessCode;
    }

    // remove an access code from the map
    revokeAccessCodeForSlot(slotID: string): void {
        this.accessCodes.forEach((value, key) => {
            if (value === slotID) {
                console.log(`Revoked access code ${key} for slot ${slotID}`);
                this.accessCodes.delete(key);
            }
        });
    }

    onRoomDestroyed(room: Room): void {
        room.getSlots().forEach(slot => this.revokeAccessCodeForSlot(slot.slotID));
    }

}