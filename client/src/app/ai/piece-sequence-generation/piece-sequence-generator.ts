/* Abstract class for implementations that enerates piece sequence. 
Could be 1/7 randomness, NES randomness, set seed, etc. */

import { TetrominoType } from "../../models/tetronimo-models/tetromino";

export abstract class PieceSequenceGenerator {

    abstract getNextPiece(): TetrominoType;

}


