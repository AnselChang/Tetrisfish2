import { HumanSlotState } from "./slot-state/human-slot-state";
import { Room } from "./room";
import { SerializedSlot } from "./serialized-room";
import { SlotState, SlotType } from "./slot-state/slot-state";

/*
A slot is a player that can be a real player or AI. A room consists of two or more slots
*/

export class Slot {

    private playerName?: string;
    private numHearts: number = 0;

    private state: SlotState | undefined;

    constructor(public readonly slotID: string, public readonly room: Room, private index: number) {

    }

    getType(): SlotType {
        if (!this.state) return SlotType.VACANT;
        return this.state.type;
    }

    assignHuman(userID: string) {
        this.state = new HumanSlotState(userID);
    }

    serialize(): SerializedSlot {
        return {
            type: this.getType(),
            index: this.index,
            playerName: this.playerName,
            numHearts: this.numHearts
        }
    }
}