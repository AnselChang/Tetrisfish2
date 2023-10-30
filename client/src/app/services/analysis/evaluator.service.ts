import { Injectable } from '@angular/core';
import { GamePosition } from '../../models/game-models/game-position';
import { EngineMovelistURL, generateStandardParamsForPosition } from './stack-rabbit-api';
import { Method, fetchServer } from '../../scripts/fetch-server';
import { MoveRecommendation } from '../../models/analysis-models/move-recommendation';
import { TetrominoType } from '../../models/tetromino-models/tetromino';
import MoveableTetromino from '../../models/game-models/moveable-tetromino';

@Injectable({
  providedIn: 'root'
})
export class EvaluatorService {

  constructor() { }

  // a weird thing in greg's code where longbar is shifted one too low
  private convertSRPlacement(type: TetrominoType, gregPlacement: [number, number, number]): {r: number, x: number, y: number} {
    const [r, x, y] = gregPlacement;

    if (type === TetrominoType.I_TYPE && r === 1) {
      return {r: 0, x: x, y: y - 1};
    }
    return {r: r, x: x, y: y};
  }

  public async evaluatePosition(position: GamePosition, inputFrameTimeline: string): Promise<MoveRecommendation[]> {

    // Generate the common portion of the uRL
    const params = generateStandardParamsForPosition(position, inputFrameTimeline);

    // Make engine-movelist request
    const movelistURL = new EngineMovelistURL(params, position.nextPieceType).getURL();
      const result = await fetchServer(Method.GET, "/api/stackrabbit", {"url" : movelistURL});
    if (result.status !== 200) {
      throw new Error("Could not evaluate position");
    }

    console.log("result:", result);

    // Process top 5 moves from engine-movelist request
    const recommendations: MoveRecommendation[] = [];
    let rank = 0;
    for (let move of result.content) {

      console.log("move:", move);

      console.log("1 placement", move[0].placement);

      // get the placement of the current and next pieces for this move
      const currentPlacement = this.convertSRPlacement(position.currentPieceType, move[0].placement);
      const currentTetronimo = new MoveableTetromino(position.currentPieceType, currentPlacement.r, currentPlacement.x, currentPlacement.y);
      const nextPlacement = this.convertSRPlacement(position.nextPieceType, move[1].placement);
      const nextTetronimo = new MoveableTetromino(position.nextPieceType, nextPlacement.r, nextPlacement.x, nextPlacement.y);
      
      // get the evaluation for this move
      const evaluation: number = move[0]["totalValue"];

      // add the move to the list of recommendations
      recommendations.push(new MoveRecommendation(rank, currentTetronimo, nextTetronimo, evaluation));

      // increment the rank, and stop if we have enough recommendations
      rank++;
      if (rank >= 5) break;
    }

    return recommendations;
  }

}
