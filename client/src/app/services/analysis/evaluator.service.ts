import { Injectable } from '@angular/core';
import { GamePosition } from '../../models/game-models/game-position';
import { EngineMovelistURL, generateStandardParamsForPosition } from './stack-rabbit-api';
import { Method, fetchServer } from '../../scripts/fetch-server';

@Injectable({
  providedIn: 'root'
})
export class EvaluatorService {

  constructor() { }

  public async evaluatePosition(position: GamePosition, inputFrameTimeline: string) {
    const params = generateStandardParamsForPosition(position, inputFrameTimeline);
    const movelistURL = new EngineMovelistURL(params, position.nextPieceType).getURL();
    
    console.log("URL:", movelistURL);
    const result = await fetchServer(Method.GET, "/api/stackrabbit", {"url" : movelistURL});
    console.log("Result:", result);

  }

}
