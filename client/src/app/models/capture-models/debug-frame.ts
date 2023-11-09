/*
Stores all the debug info for a single frame. Used for debugging capture and placement extraction
*/

import { GamePlacement } from "../game-models/game-placement";
import BinaryGrid from "../tetronimo-models/binary-grid";
import GameStatus from "../tetronimo-models/game-status";
import { TetrominoType } from "../tetronimo-models/tetromino";

export default class DebugFrame {

    public log: string[] = [];
    public logGrid: [string, BinaryGrid | undefined][] = [];
    public placement?: GamePlacement;
    public status: GameStatus = new GameStatus(0, 0, 0);

    constructor(
        public index: number,
        public grid: BinaryGrid,
        public nextBoxType: TetrominoType | undefined,
    ) {}

}