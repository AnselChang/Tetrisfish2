import { Injectable } from '@angular/core';
import { Game } from '../models/game-models/game';
import { Method, fetchServer } from '../scripts/fetch-server';
import { GameSpeed } from '../models/evaluation-models/rating';
import { TetrominoType } from '../models/tetronimo-models/tetromino';
import { SerializedGame, SerializedPlacement } from 'shared/models/serialized-game';
import { GamePlacement } from '../models/game-models/game-placement';

/*
Handles exporting a game object to the server
*/

@Injectable({
  providedIn: 'root'
})
export class GameExportService {

  constructor() { }

  private serializePlacement(placement: GamePlacement): SerializedPlacement {

    return {
      b: placement.grid._getAsString(),
      c: placement.currentPieceType,
      n: placement.nextPieceType,
      r: placement.piecePlacement!.getRotation(),
      x: placement.piecePlacement!.getTranslateX(),
      y: placement.piecePlacement!.getTranslateY(),
      l: placement.placementLineClears!,
    }

  }

  private serialize(game: Game): SerializedGame {

    const average18 = game.analysisStats.getSpeedAccuracy(GameSpeed.SPEED_18);
    const average19 = game.analysisStats.getSpeedAccuracy(GameSpeed.SPEED_19);
    const average29 = game.analysisStats.getSpeedAccuracy(GameSpeed.SPEED_29);
    const averageI = game.analysisStats.getAccuracyForPiece(TetrominoType.I_TYPE);
    const averageJ = game.analysisStats.getAccuracyForPiece(TetrominoType.J_TYPE);
    const averageL = game.analysisStats.getAccuracyForPiece(TetrominoType.L_TYPE);
    const averageO = game.analysisStats.getAccuracyForPiece(TetrominoType.O_TYPE);
    const averageS = game.analysisStats.getAccuracyForPiece(TetrominoType.S_TYPE);
    const averageT = game.analysisStats.getAccuracyForPiece(TetrominoType.T_TYPE);
    const averageZ = game.analysisStats.getAccuracyForPiece(TetrominoType.Z_TYPE);
    
    return {
      gameID: game.gameID,
      startLevel: game.startLevel,
      inputSpeed: game.inputSpeed,
      playstyle: "unknown",
      eligibleForLeaderboard: game.eligibility.getEligibility() !== undefined,

      placements: game.getAllPlacements().map(placement => this.serializePlacement(placement)),

      scoreAtTransitionTo19: game.stats.getScoreAtTransitionTo19(),
      scoreAtTransitionTo29: game.stats.getScoreAtTransitionTo29(),
      finalScore: game.getCurrentScore(),
      finalLevel: game.getCurrentLevel(),
      finalLines: game.getCurrentLines(),

      tetrisRate: game.stats.getTetrisRate(),
      droughtPercent: game.stats.getPercentInDrought(),
      tetrisReadiness: game.stats.getTetrisReadiness(),
      iPieceEfficiency: game.stats.getIPieceEfficiency(),

      accuraciesForAllPlacements: game.getAllPlacements().map(placement => placement.analysis.getRateMoveDeep()!.accuracy!),
      numMissedAdjustments: -1, // TODO
      overallAccuracy: game.analysisStats.getOverallAccuracy().getAverage(),

      accuracy18: average18?.getAverage() ?? -1,
      num18: average18?.getNumValues() ?? 0,
      accuracy19: average19?.getAverage() ?? -1,
      num19: average19?.getNumValues() ?? 0,
      accuracy29: average29?.getAverage() ?? -1,
      num29: average29?.getNumValues() ?? 0,
      accuracyI: averageI?.getAverage() ?? -1,
      numI: averageI?.getNumValues() ?? 0,
      accuracyJ: averageJ?.getAverage() ?? -1,
      numJ: averageJ?.getNumValues() ?? 0,
      accuracyL: averageL?.getAverage() ?? -1,
      numL: averageL?.getNumValues() ?? 0,
      accuracyO: averageO?.getAverage() ?? -1,
      numO: averageO?.getNumValues() ?? 0,
      accuracyS: averageS?.getAverage() ?? -1,
      numS: averageS?.getNumValues() ?? 0,
      accuracyT: averageT?.getAverage() ?? -1,
      numT: averageT?.getNumValues() ?? 0,
      accuracyZ: averageZ?.getAverage() ?? -1,
      numZ: averageZ?.getNumValues() ?? 0,
    }
  }

  public async export(game: Game) {
    
    const serializedGame = this.serialize(game);
    const {status, content} = await fetchServer(Method.POST, "/api/send-game", serializedGame);

    console.log("Response from /api/send-game:", status, content);

  }

}
