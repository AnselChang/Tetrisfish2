import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Method, fetchServer } from '../scripts/fetch-server';
import { Socket, io } from 'socket.io-client';
import { SerializedRoom } from 'server/multiplayer/serialized-room';
import { ChatMessage } from 'server/multiplayer/chat';
import { SlotType } from 'server/multiplayer/slot-state/slot-state';
import ColorGrid from '../models/tetronimo-models/color-grid';
import BinaryGrid from '../models/tetronimo-models/binary-grid';
import { areUint8ArraysEqual, decodeColorGrid, encodeColorGrid } from '../scripts/encode-color-grid';

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

export class SlotBoardData {

  public readonly binaryGrid: BinaryGrid;
  public readonly colorGrid: ColorGrid;

  constructor(encodedBoardGame?: Uint8Array) {
    if (!encodedBoardGame) {
      this.binaryGrid = new BinaryGrid();
      this.colorGrid = new ColorGrid();
    }

    const {binaryGrid, colorGrid} = decodeColorGrid(encodedBoardGame);
    this.binaryGrid = binaryGrid;
    this.colorGrid = colorGrid;
  }
}

export class SlotBoardDataManager {
  private allSlotBoardData: {[slotID: string]: SlotBoardData} = {};

  public getSlotBoardData(slotID: string): SlotBoardData {

    if (!this.allSlotBoardData[slotID]) {
      this.allSlotBoardData[slotID] = new SlotBoardData();
    }
    return this.allSlotBoardData[slotID];
  }

  public setSlotBoardData(slotID: string, encodedBoardGame?: Uint8Array) {
    this.allSlotBoardData[slotID] = new SlotBoardData(encodedBoardGame);
    console.log('setSlotBoardData', slotID, encodedBoardGame, this.allSlotBoardData[slotID]);
  }
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

  private previousEncodedBoard?: Uint8Array;

  private readonly slotBoardDataManager: SlotBoardDataManager = new SlotBoardDataManager();

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
    return this.isInRoom() && this.mySlot !== undefined;
  }

  getBoardDataForSlotID(slotID: string): SlotBoardData {
    return this.slotBoardDataManager.getSlotBoardData(slotID);
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

  // send encoded board state color data to server. should only send if there was a CHANGE in board state
  public sendBoard(binaryGrid: BinaryGrid, colorGrid: ColorGrid) {
      
      if (!this.socket) {
        console.error('socket not initialized');
        return
      }

      if (this.slotID === undefined) {
        console.error('not playing game');
        return
      }

      /* SOCKET send-board {
          slotID: string,
          board: Uint8Array, (encoded and decoded through encode-color-grid.ts)
      } */

      // only send if there was a change
      const encodedData = encodeColorGrid(binaryGrid, colorGrid);
      if (areUint8ArraysEqual(encodedData, this.previousEncodedBoard)) return;

      console.log('sending changed board', binaryGrid, colorGrid, encodedData);

      this.socket.emit('send-board', {
        slotID: this.slotID,
        board: encodedData
      });

      this.previousEncodedBoard = encodedData;
  }

  // leave as player and change to spectator mode
  public exitMatch() {

    // make sure socket is initialized so we can send message
    if (!this.socket) {
      console.error('socket not initialized');
      return
    }

    // doesn't make sense to exit match if not already playing in match
    if (!this.isPlayingGame()) {
      console.error('not playing game');
      return
    }

    /* SOCKET player-leave-match { // called when wanting to switch status from player to spectator
      roomID: string,
      userID: string
    } */
    this.socket.emit('player-leave-match', {
      roomID: this.roomID,
      userID: this.user.getUserID()
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

    /* SOCKET on-update-board {
        slotID: string,
        board: Uint8Array, (encoded and decoded through encode-color-grid.ts)
    } */
    this.socket.on('on-update-board', (data: any) => {

      const slotID = data['slotID'] as string;
      const rawEncodedBoard = data['board'];
      const encodedBoard = rawEncodedBoard ? new Uint8Array(rawEncodedBoard) : undefined;

      if (slotID === undefined) {
        console.error('no slotID provided', data);
        return
      }
      console.log('on-update-board', slotID, encodedBoard);
      this.slotBoardDataManager.setSlotBoardData(slotID, encodedBoard);
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
    this.slotID = this.mySlot?.slotID;

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

    // reset data
    this.roomID = undefined;
    this.slotID = undefined;
    this.adminUserID = undefined;
    this.isAdmin = false;
    this.numUsersConnected = 0;
    this.messages = [];
    this.mySlot = undefined;
    this.slots = [];
  }

}
