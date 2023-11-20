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
      accuracy18: game.analysisStats.getSpeedAccuracy(GameSpeed.SPEED_18)?.getAverage(),
      accuracy19: game.analysisStats.getSpeedAccuracy(GameSpeed.SPEED_19)?.getAverage(),
      accuracy29: game.analysisStats.getSpeedAccuracy(GameSpeed.SPEED_29)?.getAverage(),
      accuracyI: game.analysisStats.getAccuracyForPiece(TetrominoType.I_TYPE).getAverage(),
      accuracyJ: game.analysisStats.getAccuracyForPiece(TetrominoType.J_TYPE).getAverage(),
      accuracyL: game.analysisStats.getAccuracyForPiece(TetrominoType.L_TYPE).getAverage(),
      accuracyO: game.analysisStats.getAccuracyForPiece(TetrominoType.O_TYPE).getAverage(),
      accuracyS: game.analysisStats.getAccuracyForPiece(TetrominoType.S_TYPE).getAverage(),
      accuracyT: game.analysisStats.getAccuracyForPiece(TetrominoType.T_TYPE).getAverage(),
      accuracyZ: game.analysisStats.getAccuracyForPiece(TetrominoType.Z_TYPE).getAverage(),
    }
  }

  public async export(game: Game) {
    
    const serializedGame = this.serialize(game);
    const {status, content} = await fetchServer(Method.POST, "/api/send-game", serializedGame);

    console.log("Response from /api/send-game:", status, content);

  }

}
