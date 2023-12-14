import { Metric } from 'client/src/app/models/metric';
import { GameStats } from '../../models/game-models/game-stats';

export class StatsForLevel {
  public readonly subscore = new Metric();
  public readonly tetrisRate = new Metric();
  public readonly rightWellOpen = new Metric();
  public readonly tetrisReady = new Metric();

  public hasValues(): boolean {
    return this.subscore.hasValues();
  }
}

export enum StatLevel {
  LEVEL_18 = 18,
  LEVEL_19 = 19,
  LEVEL_29 = 29,
}

export const ALL_STAT_LEVELS = [StatLevel.LEVEL_18, StatLevel.LEVEL_19, StatLevel.LEVEL_29];

export class AISimulationStats {
  public readonly score = new Metric();
  public readonly statsForLevel: {[key in StatLevel]: StatsForLevel} = {
    [StatLevel.LEVEL_18]: new StatsForLevel(),
    [StatLevel.LEVEL_19]: new StatsForLevel(),
    [StatLevel.LEVEL_29]: new StatsForLevel(),
  };

  private numGamesPlayed: number = 0;

  public getNumGamesPlayed(): number {
    return this.numGamesPlayed;
  }

  public getCSVStatsForGameIndex(gameIndex: number): any {

    if (gameIndex < 0 || gameIndex >= this.numGamesPlayed) {
      throw new Error("Invalid game index");
    }

    return {
      "index": gameIndex,
      "score": this.score.getValues()[gameIndex],
      "18 subscore": this.statsForLevel[StatLevel.LEVEL_18].subscore.getValues()[gameIndex],
      "18 tetris rate": this.statsForLevel[StatLevel.LEVEL_18].tetrisRate.getValues()[gameIndex],
      "18 right well open": this.statsForLevel[StatLevel.LEVEL_18].rightWellOpen.getValues()[gameIndex],
      "18 tetris ready": this.statsForLevel[StatLevel.LEVEL_18].tetrisReady.getValues()[gameIndex],
      "19 subscore": this.statsForLevel[StatLevel.LEVEL_19].subscore.getValues()[gameIndex],
      "19 tetris rate": this.statsForLevel[StatLevel.LEVEL_19].tetrisRate.getValues()[gameIndex],
      "19 right well open": this.statsForLevel[StatLevel.LEVEL_19].rightWellOpen.getValues()[gameIndex],
      "19 tetris ready": this.statsForLevel[StatLevel.LEVEL_19].tetrisReady.getValues()[gameIndex],
      "29 subscore": this.statsForLevel[StatLevel.LEVEL_29].subscore.getValues()[gameIndex],
      "29 tetris rate": this.statsForLevel[StatLevel.LEVEL_29].tetrisRate.getValues()[gameIndex],
      "29 right well open": this.statsForLevel[StatLevel.LEVEL_29].rightWellOpen.getValues()[gameIndex],
      "29 tetris ready": this.statsForLevel[StatLevel.LEVEL_29].tetrisReady.getValues()[gameIndex],
    };
  }

  public getCSVStats(): any[] {
    const csvStats: any[] = [];

    for (let i = 0; i < this.numGamesPlayed; i++) {
      csvStats.push(this.getCSVStatsForGameIndex(i));
    }

    return csvStats;
  }

  // push new value to all metrics. if level was not played, all metrics for that level push value undefined
  public onGameEnd(finalScore: number, gameStats: GameStats) {
    this.numGamesPlayed++;

    this.score.push(finalScore);
    
    for (const statLevel of ALL_STAT_LEVELS) {

        let subscoreObj = gameStats.getSubscore(statLevel);
        if (subscoreObj === undefined || subscoreObj.getNumPositions() === 0) {
          this.statsForLevel[statLevel].subscore.push(undefined);
          this.statsForLevel[statLevel].tetrisRate.push(undefined);
          this.statsForLevel[statLevel].rightWellOpen.push(undefined);
          this.statsForLevel[statLevel].tetrisReady.push(undefined);
          return;
        }

        const numPositions = subscoreObj.getNumPositions();

        let subscore = subscoreObj.getScore();
        if (subscore === undefined) subscore = 0;
        this.statsForLevel[statLevel].subscore.push(subscore);
        console.log("Push subscore", subscore, "for level", statLevel);

        const tetrisRate = subscoreObj.lineClearStats.getTetrisRate();
        console.log("Push tetris rate", tetrisRate, "for level", statLevel);
        this.statsForLevel[statLevel].tetrisRate.push(tetrisRate);

        const rightWellOpen = subscoreObj.rightWellOpenStats.getRightWellOpen(numPositions);
        console.log("Push right well open", rightWellOpen, "for level", statLevel);
        this.statsForLevel[statLevel].rightWellOpen.push(rightWellOpen);

        const tetrisReady = subscoreObj.tetrisReadinessStats.getTetrisReadiness(numPositions);
        console.log("Push tetris ready", tetrisReady, "for level", statLevel);
        this.statsForLevel[statLevel].tetrisReady.push(tetrisReady);

    }
  }

}