import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EVALUATION_RATING_TO_COLOR } from 'client/src/app/misc/colors';
import { RATING_TO_COLOR, getRatingFromAveragePercent } from 'client/src/app/models/evaluation-models/rating';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { GameHistoryCacheService } from 'client/src/app/services/game-history-cache.service';
import { LoginStatus, UserService } from 'client/src/app/services/user.service';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import { filter, take } from 'rxjs';
import { GameHistoryGame } from 'shared/models/game-history-game';

@Component({
  selector: 'app-analyze-page',
  templateUrl: './analyze-page.component.html',
  styleUrls: ['./analyze-page.component.scss']
})
export class AnalyzePageComponent implements OnInit {

  private now: Date;

  constructor(private userService: UserService, private router: Router, private gameHistoryCache: GameHistoryCacheService) {
    this.now = new Date();
  }

  ngOnInit(): void {

    if (this.gameHistoryCache.hasCache()) {
      console.log("Got game history from cache:");
      return;
    }

    console.log("Getting game history from server...");

    this.userService.loginStatus$.pipe(
      filter(status => status !== LoginStatus.LIMBO), // ignore unknown login status events
      take(1) // Take only the first value that passes the filter
    ).subscribe(status => {

      const loggedIn = status === LoginStatus.LOGGED_IN;
      if (loggedIn) {

        const userID = this.userService.getUserID()!;
        
        fetchServer(Method.GET, "/api/get-games-by-player", {userID: userID}).then(({status, content}) => {
          if (status === 200) {
            this.gameHistoryCache.set(content);
            console.log("Recieved game history from server");
          }
        });
      }

    });
  }

  formatAccuracy(accuracy: number | null | undefined): string {
    if (accuracy === null || accuracy === undefined || accuracy < 0) return "-";
    return Math.round(accuracy * 10000) / 100 + "%";
  }

  getAccuracyColor(accuracy: number | null | undefined): string {
    if (accuracy === null || accuracy === undefined || accuracy < 0) return "white";
    const rating = getRatingFromAveragePercent(accuracy!);
    return RATING_TO_COLOR[rating];
  }

  getTimeString(dateStr: string): string {
    const date = new Date(dateStr);
    const result = formatDistanceStrict(date, this.now);
    return result + " ago";
  }

  // redirect to game analysis page
  onClickGame(game: GameHistoryGame) {
    this.router.navigate(['/analyze-game'], { queryParams: { id: game.gameID } });
  }

  getGameHistory(): GameHistoryGame[] {
    const games = this.gameHistoryCache.get();
    return games ? games : [];
  }

}
