import MoveableTetromino from "../../game-models/moveable-tetromino";
import { TetrominoType } from "../../tetronimo-models/tetromino";
import Tag, { TagExample } from "../abstract-tag";
import { SimplePlacement } from "../tag-assigner";
import { TagID } from "../tag-types";

export default class SFlatTag extends Tag {

    constructor() {
        super(
            TagID.S_FLAT, "s-flat", "S flat",
            "Preferred over S-90 to burn only one line and keep a flatter stack",
            new TagExample(
                "",
                new MoveableTetromino(TetrominoType.S_TYPE, 0, 0, 0),
                undefined // no second piece
            )
        );
    }

    public override identify(placement: SimplePlacement): boolean {
        
        if (placement.current.tetrominoType !== TetrominoType.S_TYPE) return false;
        if (placement.current.getRotation() !== 0) return false;

        return placement.current.getTranslateX() === 7;
        
    }

}