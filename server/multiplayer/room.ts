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
import { getUserByID } from 'server/database/user/user-service';

export class SocketUser {
    constructor(
        public readonly socket: Socket,
        public readonly sessionID: string,
        public readonly userID?: string, // undefined if not logged in
        ) {}

}

export class Room {

    private slots: Slot[] = [];
    private sockets: SocketUser[] = [];
    public readonly chat: Chat = new Chat();

    constructor(
        public readonly multiplayerManager: MultiplayerManager,
        public readonly roomID: string,
        public readonly adminUserID: string,
        public readonly adminName: string, 
    ) {

        console.log('created room', roomID, 'with admin', adminUserID);

        // start with 2 slots
        this.addSlot();
        this.addSlot();
    }

    public addSlot(): Slot {
        const slot = new Slot(uuidv4(), this, this.slots.length);
        this.slots.push(slot);
        return slot;
    }

    public isThereSocketWithSessionID(sessionID: string | undefined): boolean {
        
        for (const socketUser of this.sockets) {
            if (socketUser.sessionID === sessionID) {
                return true;
            }
        }
        return false;
    }

    public isThereSocketWithUserID(userID: string): boolean {

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
        if (this.isThereSocketWithSessionID(socketUser.sessionID)) {
            return false
        }
        this.sockets.push(socketUser);

        return true;
    }

    public getSocketUserBySocket(socket: Socket): SocketUser | undefined {
        return this.sockets.find(socketUser => socketUser.socket === socket);
    }

    // CALLED BY HTTP
    // add a human to a slot in the room. This happens after the HTTP request POST join-room-play
    // this does not necesarily mean the socket connection has been established yet. that will happen right after
    public async addHumanToRoomWithSlot(userID: string, sessionID: string, slot: Slot): Promise<boolean> {

        if (!this.isSlotInRoom(slot)) {
            console.log('addHumanToRoomWithSlot: slot not in room');
            return false;
        }

        console.log('addHumanToRoomWithSlot', userID, slot.slotID);
        await slot.assignHuman(userID, sessionID);
        this.multiplayerManager.accessCodes.revokeAccessCodeForSlot(slot.slotID);
        return true;
    }

    // CALLED BY HTTP
    // remove only the slot that contains the user sessionID
    removeHumanFromRoom(userID: string, sessionID: string) {

        this.getSlots().forEach(slot => {
            if (slot.getType() === SlotType.HUMAN && (slot.getState() as HumanSlotState).sessionID === sessionID) {
                slot.vacate();
            }
        });
    }

    public isSocketConnected(socket: Socket): boolean {
        return this.sockets.find(socketUser => socketUser.socket === socket) !== undefined;
    }

    // CALLED BY SOCKET
    // remove a socket from the room. happens on disconnect
    public removeSocket(socket: Socket): void {

        if (this.isSocketConnected(socket)) { // if socket is in room

            // remove socket from room
            this.sockets = this.sockets.filter(socketUser => socketUser.socket !== socket);

            // broadcast change
            this.onChange();
        }
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
            adminName: this.adminName,
            isAdminInRoom: this.isThereSocketWithUserID(this.adminUserID),
            numUsersConnected: this.getNumConnectedSockets(),
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

    // whether the given user with userID occupies a slot in the room
    public isUserSessionInSlot(sessionID: string | undefined): boolean {

        if (!sessionID) return false;

        for (const slot of this.slots) {
            if (slot.getType() === SlotType.HUMAN && (slot.getState() as HumanSlotState).sessionID === sessionID) {
                return true;
            }
        }
        return false;
    }

    // if userID is in a slot, remove them from the slot
    // return true if action was taken
    public removePlayerSessionFromSlot(sessionID: string): boolean {

        if (!this.isUserSessionInSlot(sessionID)) return false;

        let changed = false;
        this.getSlots().forEach(slot => {
            if (slot.getType() === SlotType.HUMAN && (slot.getState() as HumanSlotState).sessionID === sessionID) {
                slot.vacate();
                changed = true;
            }
        });

        return changed;
    }

    // anytime the room state changes, call this to broadcast the new state to all sockets in the room
    public onChange() {
        const data = this.serialize();
        console.log('broadcasting on-change', data);
        this.broadcastAll('on-change', { data: data });
    }

    // broadcast socket.io event to all sockets in the room
    public broadcastAll(event: string, data: any, volatile: boolean = false): void {
        if (volatile) this.sockets.forEach(socketUser => socketUser.socket.volatile.emit(event, data));
        else this.sockets.forEach(socketUser => socketUser.socket.emit(event, data));
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