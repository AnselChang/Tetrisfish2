import { v4 as uuidv4 } from 'uuid';
import { Room, SocketUser } from './room';
import { Socket } from 'socket.io';
import { AccessCodeManager } from './access-code-manager';
import { Slot } from './slot';
import { ChatMessage } from './chat';


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

    doesRoomExist(roomID: string): boolean {
        return this.getRoomByID(roomID) !== undefined;
    }

    doesSlotExist(slotID: string): boolean {
        for (const room of this.rooms) {
            if (room.getSlotByID(slotID)) return true;
        }
        return false;
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

    // called when a socket connects to the server
    onSocketConnectToServer(socket: Socket): void {
        console.log(`Socket ${socket.id} connected to server`);

        // when client connects, it immediately sends register-socket event to bind userID to socket
        socket.on("register-socket", (data: any) => {
                
            const userID = data['userID'] as (string | undefined);
            const roomID = data['roomID'] as (string | undefined);
            const slotID = data['slotID'] as (string | undefined);

            console.log(`Socket ${socket.id} registering with userID ${userID} and roomID ${roomID} and slotID ${slotID}`)

            this.onRegisterSocket(socket, userID, roomID, slotID).then(response => {
                socket.emit("initialize-client", response);
            });
        });

        // chat message sent by someone in room
        socket.on("send-message", (data: any) => {

            const roomID = data['roomID'] as string;
            const name = data['name'] as string;
            const userIsPro = data['userIsPro'] as boolean;
            const userIsPlayer = data['userIsPlayer'] as boolean;
            const message = data['message'] as string;

            if (roomID === undefined || name === undefined || userIsPro === undefined || userIsPlayer === undefined || message === undefined) {
                console.error("Invalid send-message data", data);
                return;
            }

            const room = this.getRoomByID(roomID);
            if (!room) {
                console.error(`Room ${roomID} not found`);
                return;
            }

            // add message to chat history
            room.chat.addMessage(new ChatMessage(name, userIsPro, userIsPlayer, message));

            // broadcast event to all sockets in room
            room.broadcastAll("on-message", {
                name: name,
                userIsPro: userIsPro,
                userIsPlayer: userIsPlayer,
                message: message
            });
        });

        socket.on("disconnect", () => {
            console.log(`Socket ${socket.id} disconnected from server`);
            this.onUnregisterSocket(socket);
        });

    }

    // called when a socket registers itself with the server. update corresponding room with socket
    async onRegisterSocket(socket: Socket, userID?: string, roomID?: string, slotID?: string): Promise<any> {

        if (!roomID || !this.doesRoomExist(roomID)) {
            return {
                success: false,
                error: "Room not found"
            };
        }

        const room = this.getRoomByID(roomID)!;

        // register socket with room
        room.addSocketUser(new SocketUser(socket, userID));

        // if slotID is not none and is in the room, assign the slot to the socket
        if (userID && slotID) {
            await room.addHumanToRoomWithSlot(userID!, room.getSlotByID(slotID)!);
        }

        room.onChange();

        return {
            success: true,
            data: room.serialize(),
            messages: room.chat.getMessages()
        };
    }

    // called when a socket disconnects from the server. remove socket from all rooms
    onUnregisterSocket(socket: Socket): void {

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

}