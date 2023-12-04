import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MultiplayerService {

  private roomID?: string
  private slotID?: string;
  private isPlaying: boolean = false;

  constructor(user: UserService) { }

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

}
