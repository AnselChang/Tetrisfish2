import { Component } from '@angular/core';

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
    ["/leaderboard", "Leaderboard"]
  ];

  public username = "Ansel"

}
