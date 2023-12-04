/*
A room has a shareable link and where 2+ players can play a game. Anyone with the link
can spectate. The one who created the room is the admin for the game and is in full control over it.
*/

import { v4 as uuidv4 } from 'uuid';
import { Socket } from "socket.io";
import { Slot } from "./slot";
import { SerializedRoom } from "./serialized-room";
import { Chat } from "./chat";
import { MultiplayerManager } from './multiplayer-manager';
import { SlotType } from './slot-state/slot-state';
import { HumanSlotState } from './slot-state/human-slot-state';

export class SocketUser {
    constructor(
        public readonly socket: Socket,
        public readonly userID?: string, // undefined if not logged in
        ) {}

}

export class Room {

    private slots: Slot[] = [];
    private sockets: SocketUser[] = [];
    public readonly chat: Chat = new Chat();

    constructor(
        private readonly multiplayerManager: MultiplayerManager,
        public readonly roomID: string,
        public adminUserID: string
    ) {

        console.log('created room', roomID, 'with admin', adminUserID);

        // start with 2 slots
        this.addSlot();
        this.addSlot();
    }

    public addSlot(): Slot {
        const slot = new Slot(uuidv4(), this, this.slots.length);
        this.slots.push(slot);
        // this.multiplayerManager.accessCodes.onSlotCreated(slot.slotID);
        return slot;
    }

    public isThereSocketWithUserID(userID: string | undefined): boolean {
        
        for (const socketUser of this.sockets) {
            if (socketUser.userID === userID) {
                return true;
            }
        }
        return false;
    }

    // CALLED BY SOCKET
    // tries to add a socket user to the room. Returns true if successful, false otherwise.
    // fails if the socketUser has userID and the userID is already in the room
    public addSocketUser(socketUser: SocketUser): boolean {
        if (socketUser.userID !== undefined && this.isThereSocketWithUserID(socketUser.userID)) {
            return false
        }
        this.sockets.push(socketUser);

        return true;
    }

    // CALLED BY HTTP
    // add a human to a slot in the room. This happens after the HTTP request POST join-room-play
    // this does not necesarily mean the socket connection has been established yet. that will happen right after
    public addHumanToRoomWithSlot(userID: string, slot: Slot): boolean {

        if (!this.isSlotInRoom(slot)) return false;

        slot.assignHuman(userID);
        this.multiplayerManager.accessCodes.onSlotRemoved(slot.slotID);
        return true;
    }

    // CALLED BY HTTP
    // remove a human with userID from room. if in slot, remove from slot.
    // if admin, promote someone else. if no human player, delete room
    removeHumanFromRoom(userID: string) {

        this.getSlots().forEach(slot => {
            if (slot.getType() === SlotType.HUMAN && (slot.getState() as HumanSlotState).userID === userID) {
                slot.vacate();
            }
        });

        if (userID === this.adminUserID) {
            // if user is admin, promote someone else or delete room
            const newAdminSlotState = (this.slots.find(slot => slot.getType() === SlotType.HUMAN))?.getState() as (HumanSlotState | undefined);

            if (newAdminSlotState) { // there's a human player in the room to promote
                console.log('promoting', newAdminSlotState.userID, 'to admin');
                this.adminUserID = newAdminSlotState.userID;
            } else { // no human players left in the room, delete room
                this.multiplayerManager.deleteRoom(this);
            }            
        }
    }

    public isSocketConnected(socket: Socket): boolean {
        return this.sockets.find(socketUser => socketUser.socket === socket) !== undefined;
    }

    // CALLED BY SOCKET
    // remove a socket from the room. happens on disconnect
    public removeSocket(socket: Socket): void {
        this.sockets = this.sockets.filter(socketUser => socketUser.socket !== socket);
    }

    public getNumConnectedSockets(): number {
        return this.sockets.length;
    }

    // serializes complete room data including all players and full chat history
    // to be sent when a player just joined the room
    public serialize(): SerializedRoom {
        return {
            roomID: this.roomID,
            adminUserID: this.adminUserID,
            numUsersConnected: this.getNumConnectedSockets(),
            messages: this.chat.getMessages(),
            slots: this.slots.map(slot => slot.serialize())
        }
    }

    public getSlots(): Slot[] {
        return this.slots;
    }

    public getSlotByID(slotID: string): Slot | undefined {
        return this.slots.find(slot => slot.slotID === slotID);
    }

    public isSlotInRoom(slot: Slot): boolean {
        return this.slots.includes(slot);
    }

    // broadcast socket.io event to all sockets in the room
    public broadcastAll(event: string, data: any): void {
        this.sockets.forEach(socketUser => socketUser.socket.emit(event, data));
    }

    // broadcast socket.io event to all sockets in the room except the given socket
    public broadcastExcept(exceptSocket: Socket, event: string, data: any): void {
        this.sockets.forEach(socketUser => {
            if (socketUser.socket !== exceptSocket) {
                socketUser.socket.emit(event, data);
            }
        });
    }
}