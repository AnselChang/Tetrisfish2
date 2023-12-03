/*
A room has a shareable link and where 2+ players can play a game. Anyone with the link
can spectate. The one who created the room is the admin for the game and is in full control over it.
*/

import { v4 as uuidv4 } from 'uuid';
import { Socket } from "socket.io";
import { Slot } from "./slot";
import { SerializedRoom } from "./serialized-room";
import { Chat } from "./chat";

export class SocketUser {
    constructor(
        public readonly socket: Socket,
        public readonly userID?: string, // undefined if not logged in
        ) {}

}

export class Room {

    private slots: Slot[] = [];
    private sockets: SocketUser[] = [];

    private chat: Chat = new Chat();

    constructor(public readonly roomID: string, public readonly adminUserID: string) {

        // start with 2 slots
        this.slots.push(new Slot(uuidv4(), this, 0));
        this.slots.push(new Slot(uuidv4(), this, 1));
    }

    public isUserInRoom(userID: string): boolean {
        for (const socketUser of this.sockets) {
            if (socketUser.userID === userID) {
                return true;
            }
        }
        return false;
    }

    // tries to add a socket user to the room. Returns true if successful, false otherwise.
    // fails if the socketUser has userID and the userID is already in the room
    public addSocketUser(socketUser: SocketUser): boolean {
        if (socketUser.userID !== undefined && this.isUserInRoom(socketUser.userID)) {
            return false
        }
        this.sockets.push(socketUser);
        return true;
    }

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
            messages: this.chat.getMessages()
        }
    }
}