import { Room } from "./room";
import { SerializedSlot } from "./serialized-room";

/*
A slot is a player that can be a real player or AI. A room consists of two or more slots
*/
export enum SlotType {
    VACANT,
    HUMAN,
    AI
}

export class Slot {

    private type: SlotType = SlotType.VACANT;
    private playerName?: string;
    private numHearts: number = 0;

    constructor(private readonly slotID: string, private readonly room: Room, private index: number) {

    }

    serialize(): SerializedSlot {
        return {
            type: this.type,
            playerName: this.playerName,
            numHearts: this.numHearts
        }
    }
}