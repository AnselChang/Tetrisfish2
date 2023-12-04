import { v4 as uuidv4 } from 'uuid';
import { Room, SocketUser } from './room';
import { Socket } from 'socket.io';
import { AccessCodeManager } from './access-code-manager';
import { Slot } from './slot';


/*
Manages all multiplayer games going on. Assigns players to rooms, etc.
*/

export class MultiplayerManager {

    private rooms: Room[] = [];
    public readonly accessCodes: AccessCodeManager = new AccessCodeManager();

    constructor() {

    }

    getRoomByID(roomID: string): Room | undefined {
        return this.rooms.find(room => room.roomID === roomID);
    }

    getRoomAndSlotByAccessCode(accessCode: number): {room: Room, slot: Slot} | undefined {
        const slotID = this.accessCodes.getSlotID(accessCode);
        if (!slotID) return undefined;
        const room = this.rooms.find(room => room.getSlotByID(slotID));
        if (!room) return undefined;
        return {room: room, slot: room.getSlotByID(slotID)!};
    }

    createNewRoom(adminUserID: string): Room {

        const room = new Room(this, uuidv4(), adminUserID);
        this.rooms.push(room);
        return room;
    }

    onSocketDisconnect(socket: Socket): void {

        const emptyRooms: Room[] = [];

        this.rooms.forEach(room => {
            room.removeSocket(socket);
            if (room.getNumConnectedSockets() === 0) emptyRooms.push(room);
        });

        // delete all empty rooms
        emptyRooms.forEach(room => {
            this.deleteRoom(room);
        });

    }

    deleteRoom(room: Room) {
        this.rooms = this.rooms.filter(r => r !== room);
        this.accessCodes.onRoomDestroyed(room);
        console.log(`Deleted room ${room.roomID}`);
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

    // called when a socket joins through access code to a specific slot. Attempt to join the room.
    onSocketJoinRoomWithAccessCode(accessCode: number, socket: Socket, userID: string): void {
        const slotID = this.accessCodes.getSlotID(accessCode);
        if (!slotID) {
            console.error(`Access code ${accessCode} not found`);
            socket.emit("on-join-room", {success: false, reason: "Access code not found"});
            return;
        }

        const result = this.getRoomAndSlotByAccessCode(accessCode);
        if (!result) {
            console.error(`Room or slot for access code ${accessCode} not found`);
            socket.emit("on-join-room", {success: false, reason: "Room or slot not found"});
            return;
        }

        // join the room
        const {room, slot} = result;
        this.onSocketJoinRoom(room.roomID, socket, userID);

        // join the slot
        slot.assignHuman(userID);

        // broadcast the new slot state to all sockets in the room
        room.broadcastAll("on-slot-filled", {
            type: slot.getType(),
            index: slot.slotID,
            data: slot.serialize()
        });
    }
}