import { Injectable } from '@angular/core';
import { TetrominoType } from '../models/tetronimo-models/tetromino';
import BinaryGrid from '../models/tetronimo-models/binary-grid';

@Injectable({
  providedIn: 'root'
})
export class BoardCreationCacheService {

  public level: number = 18;
  public grid: BinaryGrid = new BinaryGrid();
  public currentPieceType: TetrominoType = TetrominoType.J_TYPE;
  public nextPieceType: TetrominoType = TetrominoType.T_TYPE;

}
