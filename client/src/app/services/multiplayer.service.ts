import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Method, fetchServer } from '../scripts/fetch-server';
import { Socket, io } from 'socket.io-client';
import { SerializedRoom } from 'server/multiplayer/serialized-room';
import { ChatMessage } from 'server/multiplayer/chat';


@Injectable({
  providedIn: 'root'
})
export class MultiplayerService {

  private socket?: Socket;

  private roomID?: string
  private slotID?: string;
  private isPlaying: boolean = false;

  private adminUserID?: string;
  private isAdmin: boolean = false;
  private numUsersConnected: number = 0;
  private messages: ChatMessage[] = [];


  constructor(private user: UserService) { }

  // join a room given id. if slotID, then join as a player
  onJoinRoom(roomID: string, slotID?: string) {
    this.roomID = roomID;
    this.slotID = slotID;
    this.isPlaying = slotID !== undefined;
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

  isPlayingGame(): boolean {
    return this.isPlaying;
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
      })
    });

    // sync server data with client
    this.socket.on('initialize-client', (data: any) => {

      if (!data['success']) {
        console.log('failed to initialize client');
        if (data['error']) {
          console.log('error:', data['error']);
        }
        return
      }

      const roomData = data['room'] as (SerializedRoom | undefined);
      if (!roomData) {
        console.error('room data from server not found');
        return
      }

      // initialize this service with the room data
      this.onRecieveInitialServerData(roomData);

    });

    // listen for socket disconnection event
    this.socket.on('disconnect', () => {
      console.log('disconnected from socket');
    });

  }

  // when the initial server data dump is recived at the start of the socket connection
  // initialize this service with that data
  onRecieveInitialServerData(data: SerializedRoom) {

    if (this.roomID !== data.roomID) {
      console.error('roomID mismatch');
      return
    }

    this.adminUserID = data.adminUserID;
    this.isAdmin = this.adminUserID === this.user.getUserID();
    this.numUsersConnected = data.numUsersConnected;
    this.messages = data.messages;
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
