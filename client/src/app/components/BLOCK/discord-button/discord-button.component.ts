import { Component, ElementRef } from '@angular/core';
import { getBaseURL } from 'client/src/app/scripts/fetch-server';
import { ButtonComponent } from '../button/button.component';
import { ColorService } from 'client/src/app/services/color.service';

@Component({
  selector: 'app-discord-button',
  templateUrl: './discord-button.component.html',
  styleUrls: ['./discord-button.component.scss']
})
export class DiscordButtonComponent extends ButtonComponent {

  constructor(colorService: ColorService, el: ElementRef) {
    super(colorService, el);
    this.color = '#5865F2';

  }

  // redirects to discord login page
  async login() {
    const baseURL = getBaseURL();
    const url = `${baseURL}/api/auth`;
    window.location.href = url;
  }

}
