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

        let subscore = subscoreObj.getScore();
        if (subscore === undefined) subscore = 0;
        this.statsForLevel[statLevel].subscore.push(subscore);

        if (numPositions > 0) {

            const tetrisRate = subscoreObj.lineClearStats.getTetrisRate();
            this.statsForLevel[statLevel].tetrisRate.push(tetrisRate);

            const rightWellOpen = subscoreObj.rightWellOpenStats.getRightWellOpen(numPositions);
            this.statsForLevel[statLevel].rightWellOpen.push(rightWellOpen);

            const tetrisReady = subscoreObj.tetrisReadinessStats.getTetrisReadiness(numPositions);
            this.statsForLevel[statLevel].tetrisReady.push(tetrisReady);

        }
    }
  }

}