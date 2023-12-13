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

  public onGameEnd(finalScore: number, gameStats: GameStats) {
    this.score.push(finalScore);

    for (const statLevel of ALL_STAT_LEVELS) {

        let subscoreObj = gameStats.getSubscore(statLevel);
        if (subscoreObj === undefined) return;

        const numPositions = subscoreObj.getNumPositions();
        if (numPositions === 0) return;

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