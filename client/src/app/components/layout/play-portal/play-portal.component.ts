import { Component, ElementRef, ViewChild } from '@angular/core';
import { FourDigitCode, FourDigitCodeComponent } from '../../BLOCK/four-digit-code/four-digit-code.component';
import { UserService } from 'client/src/app/services/user.service';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { loginWithDiscord } from 'client/src/app/scripts/login';
import { Router } from '@angular/router';
import { MultiplayerService } from 'client/src/app/services/multiplayer/multiplayer.service';

@Component({
  selector: 'app-play-portal',
  templateUrl: './play-portal.component.html',
  styleUrls: ['./play-portal.component.scss']
})
export class PlayPortalComponent {
  @ViewChild('fourDigitCode') accessCodeInput!: FourDigitCodeComponent;

  constructor(
    public userService: UserService,
    private router: Router,
    private multiplayerService: MultiplayerService
  ) {}

  // redirect to singleplayer page
  singleplayer() {

    // redirect if not logged in
    if (!this.userService.isLoggedIn()) {
      this.login();
      return
    }
    
    this.router.navigate(['/play']);
  }

  onJoinRoomContainerClick() {
    console.log('onJoinRoomContainerClick');
    console.log(this.accessCodeInput);
    this.accessCodeInput.setSelectedDigitIndex(0);
  }

  // called when "Multiplayer" button is clicked
  async createRoom() {

    // redirect if not logged in
    if (!this.userService.isLoggedIn()) {
      this.login();
      return
    }

    const {status, content} = await fetchServer(Method.POST, '/api/multiplayer/create-room', {
      userID: this.userService.getUserID()
    });

    // failed to create room
    if (status !== 200 || !content['success']) {
      console.log('failed to create room', content);
      return
    }

    // succeeded in creating room. go to multiplayer page
    const roomID = content['roomID'] as string;
    console.log('success creating room', roomID);
    this.multiplayerService.onJoinRoom(roomID);
    this.router.navigate(['/multiplayer']);

  }

  async submitCode(code: number) {

    // redirect if not logged in
    if (!this.userService.isLoggedIn()) {
      this.login();
      return
    }

    console.log('submitCode', code);
    
    const {status, content} = await fetchServer(Method.POST, '/api/multiplayer/join-room-play', {
      accessCode: code,
      userID: this.userService.getUserID()
    });

    // access code is invalid
    if (status !== 200 || !content['success']) {
      console.log('invalid access code', content);
      this.accessCodeInput.onInvalidCode();
      return
    }

    // success. update multiplayer service
    const roomID = content['roomID'] as string;
    const slotID = content['slotID'] as string;
    console.log('success joining room as player', roomID, slotID);
    this.multiplayerService.onJoinRoom(roomID, slotID);

    // redirect to multiplayer page
    this.router.navigate(['/multiplayer']);

  }

  login() {
    loginWithDiscord(this.router);
  }

}
