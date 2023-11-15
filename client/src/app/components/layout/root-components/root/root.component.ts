import { Component } from '@angular/core';
import { Method, fetchServer, getBaseURL } from 'client/src/app/scripts/fetch-server';
import { UserService } from 'client/src/app/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent {

  public pages = [
    ["/play", "Play"],
    ["/analysis", "Analysis"],
    ["/puzzles", "Puzzles"],
    ["/leaderboard", "Leaderboard"],
    ["/more", "More..."]
  ];

  public username = "Ansel"

  constructor(public authService: UserService) {

  }

}
