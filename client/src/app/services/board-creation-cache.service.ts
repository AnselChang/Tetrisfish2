import { Injectable } from '@angular/core';
import BinaryGrid from '../models/mutable-tetris-models/binary-grid';
import { TetrominoType } from '../models/immutable-tetris-models/tetromino';

@Injectable({
  providedIn: 'root'
})
export class BoardCreationCacheService {

  public level: number = 18;
  public grid: BinaryGrid = new BinaryGrid();
  public currentPieceType: TetrominoType = TetrominoType.J_TYPE;
  public nextPieceType: TetrominoType = TetrominoType.T_TYPE;

}
