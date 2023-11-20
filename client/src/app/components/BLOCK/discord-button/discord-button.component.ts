import { Component, ElementRef, Input } from '@angular/core';
import { getBaseURL } from 'client/src/app/scripts/fetch-server';
import { ButtonComponent } from '../button/button.component';
import { ColorService } from 'client/src/app/services/color.service';
import { Router } from '@angular/router';
import { loginWithDiscord } from 'client/src/app/scripts/login';

@Component({
  selector: 'app-discord-button',
  templateUrl: './discord-button.component.html',
  styleUrls: ['./discord-button.component.scss']
})
export class DiscordButtonComponent extends ButtonComponent {
  @Input() icon: string = 'discord_logo.svg';
  @Input() label: string = "Sign in with Discord";

  constructor(colorService: ColorService, el: ElementRef, private router: Router) {
    super(colorService, el);

  }

  // redirects to discord login page
  async login() {
    loginWithDiscord(this.router);
  }

}
