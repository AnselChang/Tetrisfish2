import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { MultiplayerService } from 'client/src/app/services/multiplayer.service';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent implements OnInit, OnDestroy {

  public messageBeingTyped: string = '';

  constructor(
    public multiplayer: MultiplayerService,
    private router: Router,
    private route: ActivatedRoute,
    ) {}

  ngOnInit(): void {

    // Subscribe to paramMap to get the route parameters
    this.route.queryParams.subscribe(async params => {
      // Get room ID
      const roomID = params['room'];

      // attempt to join room as spectator
      if (roomID) {
        const {status, content} = await fetchServer(Method.GET, '/api/multiplayer/does-room-exist', {
          roomID: roomID
        });
        if (status === 200 && content['success']) {
          // room exists
          this.multiplayer.onJoinRoom(roomID, undefined); // join as spectator (no slot)
        }
      }

      // redirect if multiplayer service isn't in a valid room
      if (!this.multiplayer.isInRoom()) {
        console.log('not in room. redirecting to play-portal');
        this.router.navigate(['/play-portal']);
        return
      }

      // set URL to the current room without reloading the page 
      this.setRoomURL();

      this.multiplayer.onEnterPage();

    });
  }

  // set URL to the current room without reloading the page
  setRoomURL() {
    if (!this.multiplayer.isInRoom()) return;
    window.history.replaceState({}, "", `/multiplayer?room=${this.multiplayer.getRoomID()}`);
  }

  ngOnDestroy(): void {
    this.multiplayer.onLeavePage();
  }

  sendMessage() {

    this.multiplayer.sendMessage(this.messageBeingTyped);

    // clear message
    this.messageBeingTyped = '';
  }

}
