import { Component } from '@angular/core';
import { EVALUATION_RATING_TO_COLOR } from 'client/src/app/misc/colors';
import { RATING_TO_COLOR, getRatingFromAveragePercent } from 'client/src/app/models/evaluation-models/rating';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { LoginStatus, UserService } from 'client/src/app/services/user.service';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import { filter, take } from 'rxjs';
import { GameHistoryGame } from 'shared/models/game-history-game';

@Component({
  selector: 'app-analyze-page',
  templateUrl: './analyze-page.component.html',
  styleUrls: ['./analyze-page.component.scss']
})
export class AnalyzePageComponent {

  public gameHistory: GameHistoryGame[] = [];
  private now: Date;

  constructor(private userService: UserService) {
    this.now = new Date();
  }

  ngOnInit(): void {
    this.userService.loginStatus$.pipe(
      filter(status => status !== LoginStatus.LIMBO), // ignore unknown login status events
      take(1) // Take only the first value that passes the filter
    ).subscribe(status => {

      const loggedIn = status === LoginStatus.LOGGED_IN;
      if (loggedIn) {
        
        fetchServer(Method.GET, "/api/get-games-by-player").then(({status, content}) => {
          if (status === 200) {
            this.gameHistory = content;
            console.log("Got game history:", this.gameHistory);
          }
        });
      }

    });
  }

  formatAccuracy(accuracy: number | null | undefined): string {
    if (accuracy === null || accuracy === undefined) return "-";
    return Math.round(accuracy * 10000) / 100 + "%";
  }

  getAccuracyColor(accuracy: number | null | undefined): string {
    if (accuracy === null || accuracy === undefined) "white";
    const rating = getRatingFromAveragePercent(accuracy!);
    return RATING_TO_COLOR[rating];
  }

  getTimeString(dateStr: string): string {
    const date = new Date(dateStr);
    const result = formatDistanceStrict(date, this.now);
    return result + " ago";
  }

}
