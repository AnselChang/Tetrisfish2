import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { loginWithDiscord } from 'client/src/app/scripts/login';
import { LoginStatus, UserService } from 'client/src/app/services/user.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-how-to-play',
  templateUrl: './how-to-play.component.html',
  styleUrls: ['./how-to-play.component.scss']
})
export class HowToPlayComponent {
  @Output() onExit = new EventEmitter<void>();

  constructor(public userService: UserService, private router: Router) { }

  login() {
    loginWithDiscord(this.router);
  }

}
