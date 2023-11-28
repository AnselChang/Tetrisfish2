import { GamePlacement } from "./game-models/game-placement";
import MoveableTetromino from "./game-models/moveable-tetromino";
import { TagID } from "./tag-models/tag-types";
import BinaryGrid from "./tetronimo-models/binary-grid";

export enum PuzzleDifficulty {
    S_TIER = "S-Grade",
    A_TIER = "A-Grade",
    B_TIER = "B-Grade",
    C_TIER = "C-Grade",
}

export class Puzzle {

    // generate a puzzle from a placement, or return undefined if it doesn't fit the criteria
    // second best placement must be between -2 to -15 eval difference from first
    // S-tier puzzles have diff of 2 to < 3
    // A-tier puzzles have diff of 3 to < 6
    // B-tier puzzles have diff of 6 to < 10
    // C-tier puzzles have diff of 10 to < 15    
    static generateFromPlacement(placement: GamePlacement): Puzzle | undefined {

        const topMoves = placement.analysis.getEngineMoveListDeep()?.getRecommendations();
        if (!topMoves || topMoves.length < 2) return undefined;

        const diff = topMoves[0].evaluation - topMoves[1].evaluation;
        let difficulty: PuzzleDifficulty | undefined = undefined;

        if (diff >= 2 && diff < 3) difficulty = PuzzleDifficulty.S_TIER;
        else if (diff >= 3 && diff < 6) difficulty = PuzzleDifficulty.A_TIER;
        else if (diff >= 6 && diff < 10) difficulty = PuzzleDifficulty.B_TIER;
        else if (diff >= 10 && diff < 15) difficulty = PuzzleDifficulty.C_TIER;
        else return undefined;

        return new Puzzle(placement.grid, topMoves[0].thisPiece, topMoves[1].thisPiece, difficulty);
    }

    constructor(
        public readonly grid: BinaryGrid,
        public readonly firstPieceSolution: MoveableTetromino,
        public readonly secondPieceSolution: MoveableTetromino,
        public readonly difficulty: PuzzleDifficulty,
        public readonly tags: TagID[] = [],
    ) {}

    // encode to compressed string format
    encode(): string {
        return "";
    }

    static decode(encoded: string): Puzzle | undefined {
        return undefined;
    }

    getTitleString(): string {
        return `${this.difficulty} Puzzle`;
    }
}