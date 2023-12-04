import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Method, fetchServer } from '../scripts/fetch-server';
import { Socket, io } from 'socket.io-client';
import { SerializedRoom } from 'server/multiplayer/serialized-room';
import { ChatMessage } from 'server/multiplayer/chat';
import { SlotType } from 'server/multiplayer/slot-state/slot-state';

export class SlotData {
  constructor(
    public readonly slotID: string,
    public readonly index: number,
    public readonly type: SlotType,
    public readonly playerID?: string,
    public readonly playerName?: string,
    public readonly numHearts: number = 0,
  ) {}
}


@Injectable({
  providedIn: 'root'
})
export class MultiplayerService {

  private socket?: Socket;

  private roomID?: string
  private slotID?: string;

  private adminUserID?: string;
  private isAdmin: boolean = false;
  private numUsersConnected: number = 0;
  private messages: ChatMessage[] = [];

  private mySlot?: SlotData;

  private slots: SlotData[] = [];


  constructor(private user: UserService) { }

  // join a room given id. if slotID, then join as a player
  onJoinRoom(roomID: string, slotID?: string) {
    console.log('onJoinRoom', roomID, slotID);
    this.roomID = roomID;
    this.slotID = slotID;
  }

  getRoomID(): string | undefined {
    return this.roomID;
  }

  getSlotID(): string | undefined {
    return this.slotID;
  }

  isInRoom(): boolean {
    return this.roomID !== undefined;
  }

  getIsAdmin(): boolean {
    return this.isAdmin;
  }

  getNumUsersConnected(): number {
    return this.numUsersConnected;
  }

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  getSlots(): SlotData[] {
    return this.slots;
  }

  isPlayingGame(): boolean {
    return this.mySlot !== undefined;
  }

  /* SOCKET send-message {
    roomID: string
    name: string,
    userIsPro: boolean,
    userIsPlayer: boolean,
    message: string
  } */
  sendMessage(message: string) {

    if (!this.socket) {
      console.error('socket not initialized');
      return
    }

    this.socket.emit('send-message', {
      roomID: this.roomID,
      name: this.user.getUsername(),
      userIsPro: this.user.getProUser(),
      userIsPlayer: this.isPlayingGame(),
      message: message
    });
  }

  // on enter page, establish socket connection
  onEnterPage() {
    this.socket = io();

    // listen for socket connection event
    this.socket.on('connect', () => {
      console.log('connected to socket');

      // start socket initialization handshake
      // this tells server to associate userID with socket
      // sever should respond with initialize-client with room data
      this.socket!.emit('register-socket', {
        userID: this.user.getUserID(),
        roomID: this.roomID,
        slotID: this.slotID
      })
    });

    // listen for event to sync server data with client
    this.socket.on('initialize-client', (data: any) => {

      if (!data['success']) {
        console.log('failed to initialize client');
        if (data['error']) {
          console.log('error:', data['error']);
        }
        return
      }

      const roomData = data['data'] as (SerializedRoom | undefined);
      if (!roomData) {
        console.error('room data from server not found');
        return
      }

      const messages = data['messages'] as (ChatMessage[] | undefined);
      if (!messages) {
        console.error('messages from server not found');
        return
      }

      // initialize this service with the room data
      this.onSyncServerData(roomData);
      this.messages = messages;

    });

    // listen for event to sync server data with client. called when server data changes, excluding chat
    this.socket.on('on-change', (data: any) => {
      
      const roomData = data['data'] as (SerializedRoom | undefined);
      if (!roomData) {
        console.error('invalid on-change data', roomData);
        return
      }

      console.log('on-change', roomData);

      this.onSyncServerData(roomData);

    });

    // listen for chat message event
    this.socket.on('on-message', (data: any) => {

      const name = data['name'] as string;
      const userIsPro = data['userIsPro'] as boolean;
      const userIsPlayer = data['userIsPlayer'] as boolean;
      const message = data['message'] as string;

      if (name === undefined || userIsPro === undefined || userIsPlayer === undefined || message === undefined) {
        console.error('invalid on-message data', data);
        return
      }

      // add message to chat history
      this.messages.push(new ChatMessage(name, userIsPro, userIsPlayer, message));

    });

    // listen for socket disconnection event
    this.socket.on('disconnect', () => {
      console.log('disconnected from socket');
    });
  }

  // when the initial server data dump is recived at the start of the socket connection
  // initialize this service with that data
  onSyncServerData(data: SerializedRoom) {
    
    if (this.roomID !== data.roomID) {
      console.error('roomID mismatch', this.roomID, data.roomID);
      return
    }

    this.adminUserID = data.adminUserID;
    this.isAdmin = this.adminUserID === this.user.getUserID();
    this.numUsersConnected = data.numUsersConnected;

    // initialize slots
    this.slots = [];
    data.slots.forEach((slot, index) => {
      this.slots.push(new SlotData(slot.slotID, index, slot.type, slot.playerUserID, slot.playerName, slot.numHearts));
    });

    // find my slot, if it exists
    this.mySlot = this.slots.find(slot => slot.playerID === this.user.getUserID());

  }

  // on leave page, disconnect socket and send closing HTTP request
  onLeavePage() {

    // disconnect socket
    this.socket?.disconnect();

    // send closing HTTP request
    fetchServer(Method.POST, '/api/multiplayer/leave-room', {
      userID: this.user.getUserID(),
      roomID: this.roomID,
    });
  }

}
