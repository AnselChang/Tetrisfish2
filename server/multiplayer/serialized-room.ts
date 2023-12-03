import { ChatMessage } from "./chat";
import { SlotType } from "./slot";

export interface SerializedSlot {
    type: SlotType;
    playerName?: string;
    numHearts: number;
}

// a serialized room sent to clients when they join a room
export interface SerializedRoom {

    roomID: string;
    adminUserID: string;
    numUsersConnected: number;
    messages: ChatMessage[];

}