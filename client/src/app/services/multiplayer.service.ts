import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Method, fetchServer } from '../scripts/fetch-server';

@Injectable({
  providedIn: 'root'
})
export class MultiplayerService {

  private roomID?: string
  private slotID?: string;
  private isPlaying: boolean = false;

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

  isPlayingGame(): boolean {
    return this.isPlaying;
  }

  // on enter page, establish socket connection
  onEnterPage() {

  }

  // on leave page, disconnect socket and send closing HTTP request
  onLeavePage() {

    // send closing HTTP request
    fetchServer(Method.POST, '/api/multiplayer/leave-room', {
      userID: this.user.getUserID(),
      roomID: this.roomID,
    });
  }

}
