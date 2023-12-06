import { HumanSlotState } from "./slot-state/human-slot-state";
import { Room } from "./room";
import { SerializedSlot } from "./serialized-room";
import { SlotState, SlotType } from "./slot-state/slot-state";
import { getUserByID } from "../database/user/user-service";

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

    getHumanState(): HumanSlotState | undefined {
        if (!this.state) return undefined;
        if (this.state.type === SlotType.HUMAN) return this.state as HumanSlotState;
        return undefined;
    }

    getBoard(): Uint8Array | undefined {
        if (!this.state) return undefined;
        if (this.state.type === SlotType.HUMAN) return (this.state as HumanSlotState).getBoard();
        return undefined;
    }

    async assignHuman(userID: string) {
        this.state = new HumanSlotState(userID);
        this.playerName = (await getUserByID(userID))?.username ?? 'unknown';
    }

    serialize(): SerializedSlot {
        return {
            slotID: this.slotID,
            type: this.getType(),
            playerName: this.playerName,
            playerUserID: this.state?.type === SlotType.HUMAN ? (this.state as HumanSlotState).userID : undefined,
            numHearts: this.numHearts
        }
    }

    getState(): SlotState | undefined {
        return this.state;
    }

    // removes the person/AI from the slot
    vacate() {
        this.state = undefined;
        this.playerName = undefined;
        this.numHearts = 0;
    }
}