import { Injectable } from '@angular/core';
import { TetrominoType } from '../models/tetronimo-models/tetromino';
import BinaryGrid from '../models/tetronimo-models/binary-grid';
import { MLPlacement } from '../machine-learning/ml-placement';

@Injectable({
  providedIn: 'root'
})
export class BoardCreationCacheService {

  public grid: BinaryGrid = new BinaryGrid();
  public currentPieceType: TetrominoType = TetrominoType.J_TYPE;
  public nextPieceType: TetrominoType = TetrominoType.T_TYPE;

  public ml?: MLPlacement;

}
