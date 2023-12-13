/*
Represents the game state for one placement of a tetromino on the board, involving
the board, the placement, and the current/next pieces
Useful for analysis, puzzle generation, etc.
*/

import { TetrominoType } from "../tetronimo-models/tetromino";
import BinaryGrid, { BlockType } from "../tetronimo-models/binary-grid";
import MoveableTetromino from "./moveable-tetromino";
import PlacementAnalysis from "./placement-analysis";
import { SmartGameStatus } from "../tetronimo-models/smart-game-status"
import { TagID } from "../tag-models/tag-types";
import TagAssigner, { SimplePlacement } from "../tag-models/tag-assigner";
import { BasePlacement } from "./base-placement";

export class GamePlacement implements BasePlacement {

    // stores all the optional analysis data from SR for this placement
    public readonly analysis: PlacementAnalysis;

    public statusAfterPlacement?: SmartGameStatus;
    public piecePlacement?: MoveableTetromino; // compact way to store the pose of the current piece
    public placementLineClears?: number;

    private playerPlacementTags?: TagID[];

    constructor(
        public readonly index: number,
        public grid: BinaryGrid, // DOES NOT INCLUDE CURRENT PIECE
        public currentPieceType: TetrominoType, // type of the current piece to be placed
        public nextPieceType: TetrominoType, // type of the next box piece
        public statusBeforePlacement: SmartGameStatus, // status of the game AFTER the placement
    ) {
        this.analysis = new PlacementAnalysis(index);
    }

    hasPlacement(): boolean {
        return this.piecePlacement !== undefined;
    }

    setPlacement(piecePlacement: MoveableTetromino, lineClears: number) {
        this.piecePlacement = piecePlacement;
        this.placementLineClears = lineClears;

        // calculate what score/level/lines would be after the plcaement
        this.statusAfterPlacement = this.statusBeforePlacement.copy();
        if (lineClears > 0) this.statusAfterPlacement.onLineClear(lineClears);

    }

    assignTags(placementAfterThis: MoveableTetromino) {
        this.playerPlacementTags = TagAssigner.assignTagsFor(new SimplePlacement(
            this.grid,
            this.piecePlacement!,
            placementAfterThis
        ));
    }

    getPlayerPlacementTags(): TagID[] {
        if (!this.playerPlacementTags) return [];
        return this.playerPlacementTags;
    }

    // create a grid that includes the current piece
    getGridWithPlacement(): BinaryGrid {

        if (!this.hasPlacement()) throw new Error("No piece placement");

        // make a copy of the grid without placement to modify it
        const gridWithPiece = this.grid.copy();

        // add the current piece to the grid
        this.piecePlacement!.getCurrentBlockSet().blocks.forEach(block => {
            gridWithPiece.setAt(block.x, block.y, BlockType.FILLED);
        });

        return gridWithPiece;

    }

    getBoard(): BinaryGrid {
        return this.grid;
    }

    getMTPlacement(): MoveableTetromino {
        if (!this.hasPlacement()) throw new Error("No piece placement");
        return this.piecePlacement!;
    }

    getNextType(): TetrominoType {
        return this.nextPieceType;
    }



}
