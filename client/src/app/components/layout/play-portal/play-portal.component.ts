import { Component, ElementRef, ViewChild } from '@angular/core';
import { FourDigitCode, FourDigitCodeComponent } from '../../BLOCK/four-digit-code/four-digit-code.component';
import { UserService } from 'client/src/app/services/user.service';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { loginWithDiscord } from 'client/src/app/scripts/login';
import { Router } from '@angular/router';
import { MultiplayerService } from 'client/src/app/services/multiplayer.service';

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

  onJoinRoomContainerClick() {
    console.log('onJoinRoomContainerClick');
    console.log(this.accessCodeInput);
    this.accessCodeInput.setSelectedDigitIndex(0);
  }

  async submitCode(code: number) {

    if (!this.userService.isLoggedIn()) {
      this.login();
      return
    }

    console.log('submitCode', code);
    
    const {status, content} = await fetchServer(Method.POST, '/api/multiplayer/join-room-play', {
      accessCode: code,
      userID: this.userService.getUserID()
    });

    if (status !== 200) {
      console.log('server error', content);
      this.accessCodeInput.onInvalidCode();
      return
    }

    // invalid access code
    if (!content['success']) {
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
