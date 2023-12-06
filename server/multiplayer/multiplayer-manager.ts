import { v4 as uuidv4 } from 'uuid';
import { Room, SocketUser } from './room';
import { Socket } from 'socket.io';
import { AccessCodeManager } from './access-code-manager';
import { Slot } from './slot';
import { ChatMessage } from './chat';
import { SlotType } from './slot-state/slot-state';


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
    
    getSlotByID(slotID: string): Slot | undefined {
        for (const room of this.rooms) {
            const slot = room.getSlotByID(slotID);
            if (slot) return slot;
        }
        return undefined;
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

    // called when a socket connects to the server
    onSocketConnectToServer(socket: Socket): void {
        console.log(`Socket ${socket.id} connected to server`);

        // when client connects, it immediately sends register-socket event to bind userID to socket
        socket.on("register-socket", (data: any) => {
                
            const userID = data['userID'] as (string | undefined);
            const sessionID = data['sessionID'] as string;
            const roomID = data['roomID'] as (string | undefined);
            const slotID = data['slotID'] as (string | undefined);

            console.log(`Socket ${socket.id} registering with userID ${userID} and roomID ${roomID} and slotID ${slotID}`)

            this.onRegisterSocket(socket, sessionID, userID, roomID, slotID).then(response => {
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

        /* SOCKET send-board {
            slotID: string,
            board: Uint8Array, (encoded and decoded through encode-color-grid.ts)
        } */
        socket.on("send-board", (data: any) => {

            const slotID = data['slotID'] as string;
            const board = data['board'] as Uint8Array;

            if (slotID === undefined || board === undefined) {
                console.error("Invalid send-board data", data);
                return;
            }

            const slot = this.getSlotByID(slotID);
            if (!slot) {
                console.error(`Slot ${slotID} not found`);
                return;
            }

            if (slot.getType() !== SlotType.HUMAN) {
                console.error(`Slot ${slotID} is not a human slot`);
                return;
            }

            // set board
            slot.getHumanState()!.setBoard(board);
            
            // broadcast event to all sockets in room
            slot.room.broadcastAll("on-update-board", {
                slotID: slotID,
                board: board
            }, true);

        });

        /* SOCKET send-player-state {
            slotID: string,
            state: playerGameState.getJson()
        } */
        socket.on("send-player-state", (data: any) => {

            const slotID = data['slotID'] as string;
            const state = data['state'];

            if (slotID === undefined || state === undefined) {
                console.error("Invalid send-board data", data);
                return;
            }

            const slot = this.getSlotByID(slotID);
            if (!slot) {
                console.error(`Slot ${slotID} not found`);
                return;
            }

            if (slot.getType() !== SlotType.HUMAN) {
                console.error(`Slot ${slotID} is not a human slot`);
                return;
            }

            // set state
            slot.getHumanState()!.setState(state);
            
            // broadcast event to all sockets in room
            slot.room.broadcastAll("on-update-player", {
                slotID: slotID,
                state: state
            }, true);

        });

        /* SOCKET player-leave-match { // called when wanting to switch status from player to spectator
            roomID: string,
            userID: string
        } */
        socket.on("player-leave-match", (data: any) => {
                
            const roomID = data['roomID'] as string;
            const sessionID = data['sessionID'] as string;

            if (roomID === undefined || sessionID === undefined) {
                console.error("Invalid player-leave-match data", data);
                return;
            }

            const room = this.getRoomByID(roomID);
            if (!room) {
                console.error(`Room ${roomID} not found`);
                return;
            }

            room.removePlayerSessionFromSlot(sessionID);
            room.onChange(); // broadcast new room state to all sockets in room

        });

        socket.on("disconnect", () => {
            console.log(`Socket ${socket.id} disconnected from server`);
            this.onUnregisterSocket(socket);
        });

    }

    // called when a socket registers itself with the server. update corresponding room with socket
    async onRegisterSocket(socket: Socket, sessionID: string, userID?: string, roomID?: string, slotID?: string): Promise<any> {

        if (!roomID || !this.doesRoomExist(roomID)) {
            return {
                success: false,
                error: "Room not found"
            };
        }

        const room = this.getRoomByID(roomID)!;

        // register socket with room
        room.addSocketUser(new SocketUser(socket, sessionID, userID));

        // if slotID is not none and is in the room, assign the slot to the socket
        if (userID && slotID) {
            await room.addHumanToRoomWithSlot(userID!, sessionID, room.getSlotByID(slotID)!);
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