import { Component, ElementRef, ViewChild } from '@angular/core';
import { FourDigitCode, FourDigitCodeComponent } from '../../BLOCK/four-digit-code/four-digit-code.component';

@Component({
  selector: 'app-play-portal',
  templateUrl: './play-portal.component.html',
  styleUrls: ['./play-portal.component.scss']
})
export class PlayPortalComponent {
  @ViewChild('fourDigitCode') accessCodeInput!: FourDigitCodeComponent;

  public accessCode: FourDigitCode = new FourDigitCode();

  onJoinRoomContainerClick() {
    this.accessCodeInput.setSelectedDigitIndex(0);
  }

}
