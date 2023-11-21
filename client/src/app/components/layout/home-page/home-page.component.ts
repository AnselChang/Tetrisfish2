import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { loginWithDiscord } from 'client/src/app/scripts/login';
import { GlobalStats } from 'server/database/global-stats/global-stats-schema';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, OnDestroy {

  public value = 0;

  public globalStatInfo = [
    {
      title: "Positions Analyzed",
      icon: "analysis.png",
      value: 0,
    },
    {
      title: "Games Played",
      icon: "games.png",
      value: 0,
    },
    {
      title: "Puzzles Solved",
      icon: "puzzle.png",
      value: 0,
    }
  ]

  private intervalID!: any;

  constructor(private router: Router, private notifier: NotifierService) {}

  ngOnInit() {

    this.syncGlobalStats();

    // every 5 seconds, sync global stats
    this.intervalID = setInterval(() => {
      this.syncGlobalStats();
    }, 5000);
  }

  public syncGlobalStats() {
    fetchServer(Method.GET, "/api/get-global-stats").then(({ status, content}) => {
      if (status === 200) {
        const globalStats = content as GlobalStats;
        console.log(globalStats);

        this.globalStatInfo[0].value = globalStats.placementCount;
        this.globalStatInfo[1].value = globalStats.gameCount;
        this.globalStatInfo[2].value = globalStats.puzzleCount;

      } else {
        console.log("error");
      }
    });
  }

  login() {
    loginWithDiscord(this.router);
  }

  ngOnDestroy() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
  }


}
