import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MultiplayerService } from 'client/src/app/services/multiplayer.service';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent implements OnInit, OnDestroy {

  public messageBeingTyped: string = '';

  constructor(public multiplayer: MultiplayerService, private router: Router) {}

  ngOnInit(): void {

    // redirect if multiplayer service isn't in a room
    if (!this.multiplayer.isInRoom()) {
      console.log('not in room. redirecting to play-portal');
      this.router.navigate(['/play-portal']);
      return
    }

    this.multiplayer.onEnterPage();
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
