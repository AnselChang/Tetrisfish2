/*
The model for a full game, consisting of a list of placements optionally with evaluations
*/

import BinaryGrid from "../tetronimo-models/binary-grid";
import GameStatus from "../tetronimo-models/game-status";
import { SmartGameStatus } from "../tetronimo-models/smart-game-status";
import { TetrominoType } from "../tetronimo-models/tetromino";
import { GamePlacement } from "./game-placement";
import MoveableTetromino from "./moveable-tetromino";

export class Game {

    private placements: GamePlacement[] = [];
    

    constructor(public readonly startLevel: number) {
    }

    // get the last position, which does not necessarily have a placement
    public getLastPosition(): GamePlacement | undefined {
        return this.placements[this.placements.length - 1];
    }

    // get the last position that has a placement
    public getLastPlacement(): GamePlacement | undefined {
        
        const lastPosition = this.getLastPosition();
        if (!lastPosition) return undefined;
        if (lastPosition.hasPlacement()) return lastPosition;
        if (this.placements.length < 2) return undefined;

        const secondLastPosition = this.placements[this.placements.length - 2];
        if (!secondLastPosition.hasPlacement()) throw new Error("Inconsistent state: last two positions both don't have placement");
        return secondLastPosition;
    }

    public addNewPosition(grid: BinaryGrid, currentPieceType: TetrominoType, nextPieceType: TetrominoType) {
        if (this.getLastPosition() && !this.getLastPosition()!.hasPlacement()) {
            throw new Error("Cannot add new position to game where the last state also had no placement");
        }
        this.placements.push(new GamePlacement(grid, currentPieceType, nextPieceType, undefined, undefined));
    }

    public setPlacementForLastPosition(moveableTetronimo: MoveableTetromino, statusAfterPlacement: GameStatus) {
        
        if (!this.getLastPosition() || this.getLastPosition()!.hasPlacement()) throw new Error("No last placement to set placement for");

        this.getLastPosition()!.setPlacement(moveableTetronimo, statusAfterPlacement.copy());
    }

}