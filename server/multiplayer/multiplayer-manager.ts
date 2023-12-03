import { v4 as uuidv4 } from 'uuid';
import { Room, SocketUser } from './room';
import { Socket } from 'socket.io';


/*
Manages all multiplayer games going on. Assigns players to rooms, etc.
*/

export class MultiplayerManager {

    private rooms: Room[] = [];

    constructor() {

    }

    getRoomByID(roomID: string): Room | undefined {
        return this.rooms.find(room => room.roomID === roomID);
    }

    createNewRoom(adminUserID: string): Room {
        const room = new Room(uuidv4(), adminUserID);
        this.rooms.push(room);
        return room;
    }

    onSocketDisconnect(socket: Socket): void {
        this.rooms.forEach(room => room.removeSocket(socket));
    }

    // called when a socket joins through room link. Attempt to join the room.
    onSocketJoinRoom(roomID: string, socket: Socket, userID?: string): void {

        const room = this.getRoomByID(roomID);
        if (!room) {
            console.error(`Room ${roomID} not found`);
            socket.emit("on-join-room", {success: false, reason: "Room not found"});
            return;
        }

        const socketUser = new SocketUser(socket, userID);
        const success = room.addSocketUser(socketUser);
        if (!success) {
            console.error(`Socket already in room ${roomID}`);
            socket.emit("on-join-room", {success: false, reason: "Socket already in room"});
        }

        console.log(`Socket ${socket.id} joined room ${roomID}`);
        socket.emit("on-join-room", {success: true, room: room.serialize()});
        
    }

}