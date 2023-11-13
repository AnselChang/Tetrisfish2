import MoveableTetromino from "../game-models/moveable-tetromino";
import { SimplePlacement } from "./tag-assigner";
import { TagID } from "./tag-types";

// an example placement for a tag to explain its purpose
export class TagExample {
    constructor(
        public readonly boardString: string, // the board in string format, which can be built into a BinaryGrid
        public readonly currentPiece: MoveableTetromino, // location of first piece
        public readonly nextPiece?: MoveableTetromino, // if tag is for a two-piece combo, location of second piece
    ) {}
}

export default abstract class Tag {

    constructor(
        public readonly id: TagID,
        public readonly tagName: string, // name on tag element (lowercase, hyphens instead of spaces)
        public readonly titleName: string, // name as a title
        public readonly description: string, // info on what the tag means. Ideally <100 characters
        public readonly example?: TagExample, // an example placement for a tag to explain its purpose
    ) {}

    // given a board and piece placements, return true if this tag applies
    public abstract identify(placement: SimplePlacement): boolean;
    
}
